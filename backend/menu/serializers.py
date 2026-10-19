from rest_framework import serializers
from .models import Category, MenuItem, SizeOption


class SizeOptionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = SizeOption
        fields = ['id', 'name', 'price', 'order']


class MenuItemSerializer(serializers.ModelSerializer):
    sizes = SizeOptionSerializer(many=True, required=False)
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description', 'price',
            'has_sizes', 'sizes', 'image', 'is_available', 'order'
        ]
        extra_kwargs = {
            'price': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        sizes_data = validated_data.pop('sizes', [])
        item = MenuItem.objects.create(**validated_data)
        for s in sizes_data:
            s.pop('id', None)
            SizeOption.objects.create(item=item, **s)
        return item

    def update(self, instance, validated_data):
        sizes_data = validated_data.pop('sizes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if sizes_data is not None:
            instance.sizes.all().delete()
            for s in sizes_data:
                s.pop('id', None)
                SizeOption.objects.create(item=instance, **s)
        return instance


class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'order', 'items']
