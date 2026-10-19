from django.db import models


class Category(models.Model):
    """قسم من أقسام المنيو"""
    name = models.CharField(max_length=100, verbose_name="اسم القسم")
    icon = models.CharField(max_length=10, default="🍽️", verbose_name="أيقونة")
    order = models.IntegerField(default=0, verbose_name="ترتيب العرض")

    class Meta:
        ordering = ['order']
        verbose_name = "قسم"
        verbose_name_plural = "الأقسام"

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """صنف من أصناف المنيو"""
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='items', verbose_name="القسم"
    )
    name = models.CharField(max_length=200, verbose_name="اسم الصنف")
    description = models.TextField(blank=True, default="", verbose_name="الوصف")
    price = models.DecimalField(
        max_digits=8, decimal_places=2,
        null=True, blank=True, verbose_name="السعر"
    )
    has_sizes = models.BooleanField(default=False, verbose_name="له أحجام متعددة")
    image = models.ImageField(
        upload_to='menu_images/', blank=True, null=True,
        verbose_name="صورة الصنف"
    )
    is_available = models.BooleanField(default=True, verbose_name="متاح")
    order = models.IntegerField(default=0, verbose_name="ترتيب العرض")

    class Meta:
        ordering = ['order']
        verbose_name = "صنف"
        verbose_name_plural = "الأصناف"

    def __str__(self):
        return f"{self.name} - {self.category.name}"


class SizeOption(models.Model):
    """أحجام الصنف (مثل ربع، نص، كيلو)"""
    item = models.ForeignKey(
        MenuItem, on_delete=models.CASCADE,
        related_name='sizes', verbose_name="الصنف"
    )
    name = models.CharField(max_length=50, verbose_name="الحجم")
    price = models.DecimalField(
        max_digits=8, decimal_places=2, verbose_name="السعر"
    )
    order = models.IntegerField(default=0, verbose_name="ترتيب العرض")

    class Meta:
        ordering = ['order']
        verbose_name = "حجم"
        verbose_name_plural = "الأحجام"

    def __str__(self):
        return f"{self.item.name} - {self.name}: {self.price}"
