from django.contrib import admin
from .models import Category, MenuItem, SizeOption


class SizeOptionInline(admin.TabularInline):
    model = SizeOption
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'order']
    list_editable = ['order', 'icon']
    ordering = ['order']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'has_sizes', 'is_available', 'order']
    list_filter = ['category', 'is_available', 'has_sizes']
    list_editable = ['price', 'is_available', 'order']
    search_fields = ['name', 'description']
    inlines = [SizeOptionInline]
    ordering = ['category__order', 'order']


@admin.register(SizeOption)
class SizeOptionAdmin(admin.ModelAdmin):
    list_display = ['item', 'name', 'price', 'order']
    list_filter = ['item__category']
    ordering = ['item__category__order', 'item__order', 'order']


from .models import Order, OrderItem  # noqa: E402


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_type', 'status', 'source', 'table_number', 'customer_name', 'total', 'created_at')
    list_filter = ('order_type', 'status', 'source')
    inlines = [OrderItemInline]
