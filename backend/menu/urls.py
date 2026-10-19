from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'items', views.MenuItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('menu/', views.menu_full, name='menu-full'),
    path('auth/login/', views.manager_login, name='manager-login'),
]
