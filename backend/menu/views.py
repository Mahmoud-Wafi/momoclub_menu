from django.contrib.auth import authenticate
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Category, MenuItem, SizeOption
from .serializers import CategorySerializer, MenuItemSerializer, SizeOptionSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """API endpoint لأقسام المنيو (عرض، إضافة، تعديل، حذف)"""
    queryset = Category.objects.prefetch_related('items__sizes').all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class MenuItemViewSet(viewsets.ModelViewSet):
    """API endpoint لأصناف المنيو (عرض، إضافة، تعديل، حذف، بحث)"""
    queryset = MenuItem.objects.select_related('category').prefetch_related('sizes').all()
    serializer_class = MenuItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = MenuItem.objects.select_related('category').prefetch_related('sizes').all()
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
    include_unavailable = request.query_params.get('all') == 'true'
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
def manager_login(request):
    """تسجيل دخول المدير للداشبورد"""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    user = authenticate(username=username, password=password)
    if user is not None and (user.is_staff or user.is_superuser):
        return Response({
            'success': True,
            'username': user.username,
            'is_manager': True,
            'message': 'تم تسجيل الدخول بنجاح كمدير'
        })

    return Response({
        'success': False,
        'message': 'اسم المستخدم أو كلمة المرور غير صحيحة'
    }, status=status.HTTP_401_UNAUTHORIZED)

