from django.contrib.auth import authenticate
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from .models import Category, MenuItem, SizeOption
from .permissions import IsManagerOrReadOnly
from .serializers import CategorySerializer, MenuItemSerializer, SizeOptionSerializer


def _is_manager(user):
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


class CategoryViewSet(viewsets.ModelViewSet):
    """API endpoint لأقسام المنيو (عرض، إضافة، تعديل، حذف)"""
    queryset = Category.objects.prefetch_related('items__sizes').all()
    serializer_class = CategorySerializer
    permission_classes = [IsManagerOrReadOnly]


class MenuItemViewSet(viewsets.ModelViewSet):
    """API endpoint لأصناف المنيو (عرض، إضافة، تعديل، حذف، بحث)"""
    queryset = MenuItem.objects.select_related('category').prefetch_related('sizes').all()
    serializer_class = MenuItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = MenuItem.objects.select_related('category').prefetch_related('sizes').all()
        # الزبائن يرون الأصناف المتاحة فقط، المدير يرى الكل
        if not _is_manager(self.request.user):
            qs = qs.filter(is_available=True)
        # إذا تم طلب المتاح فقط
        if self.request.query_params.get('available_only') == 'true':
            qs = qs.filter(is_available=True)
        category_id = self.request.query_params.get('category_id')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


@api_view(['GET'])
@permission_classes([AllowAny])
def menu_full(request):
    """عرض المنيو كامل مع جميع الأقسام والأصناف"""
    # إذا كان للمدير يمكنه رؤية كل الأصناف، أما للزبائن فالمتاحة فقط أو الكل
    include_unavailable = request.query_params.get('all') == 'true' and _is_manager(request.user)
    categories = Category.objects.prefetch_related('items__sizes').all()
    serializer = CategorySerializer(categories, many=True, context={'request': request})
    data = serializer.data
    if not include_unavailable:
        # فلترة الأصناف غير المتاحة من العرض العام
        for cat in data:
            cat['items'] = [item for item in cat.get('items', []) if item.get('is_available', True)]
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def manager_login(request):
    """تسجيل دخول المدير للداشبورد"""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    user = authenticate(username=username, password=password)
    if user is not None and (user.is_staff or user.is_superuser):
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'token': token.key,
            'username': user.username,
            'is_manager': True,
            'message': 'تم تسجيل الدخول بنجاح كمدير'
        })

    return Response({
        'success': False,
        'message': 'اسم المستخدم أو كلمة المرور غير صحيحة'
    }, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manager_logout(request):
    """إلغاء توكن المدير الحالي"""
    Token.objects.filter(user=request.user).delete()
    return Response({'success': True})
