# dicaprios_backend/productos/views.py
from rest_framework import viewsets, status # Añadido status
from rest_framework.permissions import IsAuthenticated # Nombre correcto
from rest_framework.decorators import action # <--- CORRECCIÓN: Importar action
from rest_framework.response import Response # <--- CORRECCIÓN: Importar Response
from .models import Producto, Categoria, Proveedor
from .serializers import ProductoSerializer, CategoriaSerializer, ProveedorSerializer
from django.db import transaction

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('nombre_categoria') # Buena práctica añadir order_by
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated] # Aplicar permisos

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('nombre_producto')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated] # Usar nombre correcto

    def get_queryset(self):
        queryset = super().get_queryset()
        proveedor_id = self.request.query_params.get('proveedor_id')
        if proveedor_id:
            try:
                proveedor_id_int = int(proveedor_id)
                # Tu filtro original era proveedor__id, lo cual es correcto. 
                # proveedor_id también funciona si el campo es una FK directa.
                queryset = queryset.filter(proveedor_id=proveedor_id_int) 
            except ValueError:
                # Devolver un queryset vacío si el ID no es válido es una buena práctica
                return queryset.none() 
        
        categoria_id = self.request.query_params.get('categoria_id')
        if categoria_id:
            try:
                categoria_id_int = int(categoria_id)
                queryset = queryset.filter(categoria_id=categoria_id_int)
            except ValueError:
                return queryset.none()
        return queryset
    
    @action(detail=False, methods=['post'], url_path='actualizar-stock-lote')
    @transaction.atomic
    def actualizar_stock_lote(self, request):
        productos_data = request.data
        if not isinstance(productos_data, list):
            return Response({"error": "Se esperaba una lista de productos."}, status=status.HTTP_400_BAD_REQUEST)
        if not productos_data:
            return Response({"mensaje": "No se proporcionaron productos para actualizar."}, status=status.HTTP_200_OK)

        actualizados_info = []
        # Usaremos una lista para acumular errores. Si hay alguno, revertiremos al final.
        errores_items = []

        for item_data in productos_data:
            producto_id = item_data.get('producto_id')
            cantidad_str = item_data.get('cantidad_a_anadir')

            if producto_id is None or cantidad_str is None:
                errores_items.append({"item": item_data, "error": "Falta producto_id o cantidad_a_anadir."})
                continue # Continuar para recolectar todos los errores de formato
            
            try:
                cantidad_a_anadir = int(cantidad_str)
                if cantidad_a_anadir < 0: # No permitir cantidades negativas
                    errores_items.append({"producto_id": producto_id, "error": "La cantidad a añadir no puede ser negativa."})
                    continue
                if cantidad_a_anadir == 0: # Omitir si la cantidad es 0, no es un error
                    actualizados_info.append({"producto_id": producto_id, "mensaje": "Cantidad cero, no se actualizó."})
                    continue
            except ValueError:
                errores_items.append({"producto_id": producto_id, "error": "La cantidad a añadir debe ser un número entero."})
                continue

            try:
                producto = Producto.objects.select_for_update().get(pk=producto_id)
                stock_anterior = producto.stock # Guardar stock anterior para la respuesta
                producto.stock += cantidad_a_anadir
                producto.save()
                actualizados_info.append({
                    "producto_id": producto.id,
                    "nombre_producto": producto.nombre_producto,
                    "stock_anterior": stock_anterior,
                    "cantidad_anadida": cantidad_a_anadir,
                    "nuevo_stock": producto.stock
                })
            except Producto.DoesNotExist:
                errores_items.append({"producto_id": producto_id, "error": "Producto no encontrado."})
            except Exception as e: # Otras excepciones inesperadas
                errores_items.append({"producto_id": producto_id, "error": f"Error inesperado: {str(e)}"})
        
        if errores_items:
            # Si hubo cualquier error en la validación de los items o al encontrar productos,
            # la transacción debería revertirse. @transaction.atomic se encarga de esto si
            # una excepción no controlada se propaga. Para asegurar la reversión explícitamente
            # si hemos capturado las excepciones:
            transaction.set_rollback(True)
            return Response({
                "mensaje": "La actualización de stock falló debido a errores en los datos. No se realizaron cambios.",
                "errores_detalle": errores_items,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not actualizados_info: # Si la lista de productos_data estaba vacía o todas las cantidades eran 0
            return Response({
                "mensaje": "No se procesaron productos para actualizar (lista vacía o cantidades cero).",
            }, status=status.HTTP_200_OK)

        return Response({
            "mensaje": "Stock actualizado exitosamente.",
            "productos_actualizados_detalle": actualizados_info
        }, status=status.HTTP_200_OK)


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('nombre_proveedor') # Añadir order_by
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated] # Aplicar permisos