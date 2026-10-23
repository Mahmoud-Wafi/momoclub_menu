from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, orders

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'items', views.MenuItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('menu/', views.menu_full, name='menu-full'),
    path('orders/', orders.create_order, name='order-create'),
    path('cashier/auth/login/', orders.cashier_login, name='cashier-login'),
    path('cashier/auth/logout/', orders.cashier_logout, name='cashier-logout'),
    path('cashier/orders/', orders.cashier_orders, name='cashier-orders'),
    path('cashier/orders/<int:pk>/ack/', orders.cashier_order_ack, name='cashier-order-ack'),
    path('auth/logout/', views.manager_logout, name='manager-logout'),
    path('auth/login/', views.manager_login, name='manager-login'),
]
