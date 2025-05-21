from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from clientes.views import ClienteViewSet
from productos.views import ProductoViewSet, ProveedorViewSet, CategoriaViewSet
from ventas.views import PedidoViewSet, DetallePedidoViewSet, FacturaViewSet, DetalleFacturaViewSet

router = routers.DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'detalles-pedido', DetallePedidoViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'detalles-factura', DetalleFacturaViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
