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


class Order(models.Model):
    """طلب من العميل (داخل المطعم أو ديليفري)"""
    TYPE_CHOICES = [('dine-in', 'داخل المطعم'), ('delivery', 'ديليفري')]
    SOURCE_CHOICES = [('app', 'المنيو'), ('whatsapp', 'واتساب')]

    order_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="نوع الطلب")
    acknowledged_at = models.DateTimeField(null=True, blank=True, db_index=True, verbose_name="وقت موافقة الكاشير")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='app', verbose_name="المصدر")
    table_number = models.CharField(max_length=20, blank=True, default="", verbose_name="رقم الطاولة")
    customer_name = models.CharField(max_length=100, blank=True, default="", verbose_name="اسم العميل")
    customer_phone = models.CharField(max_length=20, blank=True, default="", verbose_name="رقم الهاتف")
    customer_address = models.CharField(max_length=300, blank=True, default="", verbose_name="العنوان")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="الإجمالي")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "طلب"
        verbose_name_plural = "الطلبات"

    def __str__(self):
        return f"#{self.id} - {self.get_order_type_display()}"


class OrderItem(models.Model):
    """صنف داخل الطلب (الاسم والسعر محفوظان وقت الطلب)"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    name = models.CharField(max_length=200)
    size = models.CharField(max_length=50, blank=True, default="")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    note = models.CharField(max_length=200, blank=True, default="")

    def __str__(self):
        return f"{self.quantity} x {self.name}"
