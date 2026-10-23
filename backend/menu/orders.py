"""الطلبات: إنشاء الطلب من العميل (بدون تسجيل دخول) + لوحة الكاشير (بتوكن منفصل)."""
import re
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import MenuItem, Order, OrderItem

CASHIER_GROUP = 'cashier'
RETENTION = timedelta(hours=1)  # orders are deleted this long after the cashier presses OK
_DIGITS = str.maketrans('٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789')


class OrderRateThrottle(AnonRateThrottle):
    scope = 'order'


class CashierLoginThrottle(AnonRateThrottle):
    scope = 'login'


class IsCashier(BasePermission):
    """الكاشير فقط (مجموعة cashier). المدير العادي لا يدخل هنا إلا لو كان superuser."""
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_superuser or u.groups.filter(name=CASHIER_GROUP).exists()))


def purge_expired_orders():
    """يحذف الطلبات التي مرّت ساعة على موافقة الكاشير عليها (لا حاجة لمهمة مجدولة)."""
    Order.objects.filter(acknowledged_at__lt=timezone.now() - RETENTION).delete()


# ---------- إنشاء الطلب (عام) ----------
class OrderLineIn(serializers.Serializer):
    id = serializers.IntegerField()
    size = serializers.CharField(required=False, allow_blank=True, max_length=50, default='')
    quantity = serializers.IntegerField(min_value=1, max_value=50)
    note = serializers.CharField(required=False, allow_blank=True, max_length=200, default='')


class OrderCreateSerializer(serializers.Serializer):
    order_type = serializers.ChoiceField(choices=['dine-in', 'delivery'])
    source = serializers.ChoiceField(choices=['app', 'whatsapp'], default='app')
    table_number = serializers.CharField(required=False, allow_blank=True, max_length=20, default='')
    customer_name = serializers.CharField(required=False, allow_blank=True, max_length=100, default='')
    customer_phone = serializers.CharField(required=False, allow_blank=True, max_length=20, default='')
    customer_address = serializers.CharField(required=False, allow_blank=True, max_length=300, default='')
    items = OrderLineIn(many=True, allow_empty=False, max_length=60)

    def validate(self, data):
        for f in ('table_number', 'customer_name', 'customer_address'):
            data[f] = data.get(f, '').strip()
        phone = data.get('customer_phone', '').translate(_DIGITS)
        data['customer_phone'] = re.sub(r'[\s\-+()]', '', phone)
        if data['order_type'] == 'dine-in':
            if not data['table_number']:
                raise serializers.ValidationError({'table_number': 'رقم الطاولة مطلوب'})
        else:
            if not data['customer_name'] or not data['customer_address']:
                raise serializers.ValidationError({'customer_name': 'الاسم والعنوان مطلوبان للتوصيل'})
            p = data['customer_phone']
            if p.startswith('20') and len(p) == 12:
                p = '0' + p[2:]
            if not re.fullmatch(r'01[0125]\d{8}', p):
                raise serializers.ValidationError({'customer_phone': 'رقم الهاتف غير صحيح'})
            data['customer_phone'] = p
        return data

    @transaction.atomic
    def create(self, data):
        wanted = {line['id'] for line in data['items']}
        menu = {m.id: m for m in MenuItem.objects.filter(id__in=wanted, is_available=True).prefetch_related('sizes')}
        order = Order.objects.create(
            order_type=data['order_type'], source=data['source'], table_number=data['table_number'],
            customer_name=data['customer_name'], customer_phone=data['customer_phone'],
            customer_address=data['customer_address'],
        )
        total = Decimal('0')
        for line in data['items']:
            item = menu.get(line['id'])
            if not item:
                raise serializers.ValidationError({'items': 'أحد الأصناف غير متاح حاليًا'})
            size_name = line['size'].strip()
            if item.has_sizes:
                size = next((s for s in item.sizes.all() if s.name == size_name), None) or (item.sizes.all()[0] if item.sizes.all() else None)
                if not size:
                    raise serializers.ValidationError({'items': 'الصنف بدون أسعار'})
                price, size_name = size.price, size.name
            else:
                if item.price is None:
                    raise serializers.ValidationError({'items': 'الصنف بدون سعر'})
                price, size_name = item.price, ''
            OrderItem.objects.create(order=order, menu_item=item, name=item.name, size=size_name,
                                     price=price, quantity=line['quantity'], note=' '.join(line['note'].split()))
            total += price * line['quantity']
        order.total = total
        order.save(update_fields=['total'])
        return order


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([OrderRateThrottle])
def create_order(request):
    purge_expired_orders()
    ser = OrderCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    order = ser.save()
    return Response({'id': order.id, 'total': str(order.total)}, status=status.HTTP_201_CREATED)


# ---------- لوحة الكاشير ----------
class OrderItemOut(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'name', 'size', 'price', 'quantity', 'note']


class OrderOut(serializers.ModelSerializer):
    items = OrderItemOut(many=True, read_only=True)
    expires_at = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'order_type', 'source', 'table_number', 'customer_name', 'customer_phone',
                  'customer_address', 'total', 'created_at', 'acknowledged_at', 'expires_at', 'items']

    def get_expires_at(self, obj):
        return obj.acknowledged_at + RETENTION if obj.acknowledged_at else None


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([CashierLoginThrottle])
def cashier_login(request):
    user = authenticate(username=request.data.get('username', ''), password=request.data.get('password', ''))
    if not user or not (user.is_superuser or user.groups.filter(name=CASHIER_GROUP).exists()):
        return Response({'success': False, 'message': 'بيانات الدخول غير صحيحة'}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'success': True, 'token': token.key, 'username': user.username})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cashier_logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsCashier])
def cashier_orders(request):
    """كل الطلبات الحالية: الجديدة (لم يوافق عليها الكاشير) أولًا ثم الباقي."""
    purge_expired_orders()
    orders = list(Order.objects.prefetch_related('items').order_by('created_at'))
    orders.sort(key=lambda x: (x.acknowledged_at is not None, x.created_at))
    return Response({'orders': OrderOut(orders, many=True).data,
                     'retention_minutes': int(RETENTION.total_seconds() // 60)})


@api_view(['POST'])
@permission_classes([IsCashier])
def cashier_order_ack(request, pk):
    """موافقة الكاشير: ينتقل الطلب من «جديد» إلى القائمة العادية، وتبدأ مهلة الحذف."""
    try:
        order = Order.objects.prefetch_related('items').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'message': 'الطلب غير موجود'}, status=status.HTTP_404_NOT_FOUND)
    if order.acknowledged_at is None:
        order.acknowledged_at = timezone.now()
        order.save(update_fields=['acknowledged_at', 'updated_at'])
    return Response(OrderOut(order).data)
