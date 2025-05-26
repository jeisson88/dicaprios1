from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated as IsAutheticated  # Asegurarse de que se importe correctamente
from .models import Producto, Categoria, Proveedor # Importar Proveedor
from .serializers import ProductoSerializer, CategoriaSerializer, ProveedorSerializer # Importar ProveedorSerializer
from django.db import transaction # Para operaciones atómicas
from rest_framework.decorators import action 
from rest_framework.response import Response 

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('nombre_producto')
    serializer_class = ProductoSerializer
    permission_classes = [IsAutheticated]  # Permisos personalizados si es necesario

    def get_queryset(self):
        queryset = super().get_queryset()
        proveedor_id = self.request.query_params.get('proveedor_id')
        if proveedor_id:
            queryset = queryset.filter(proveedor__id=proveedor_id)
        
        # Mantener otros filtros si los tenia
        categoria_id = self.request.query_params.get('categoria_id')
        if categoria_id:
            queryset = queryset.filter(categoria__id=categoria_id)
        return queryset
    
    @action(detail=False, methods=['post'], url_path='actualizar-stock-lote')
    @transaction.atomic # Para asegurar que todas las actualizaciones se hagan o ninguna
    def actualizar_stock_lote(self, request):
        """
        Recibe una lista de productos con cantidades para añadir al stock.
        Formato esperado del request.data:
        [
            {"producto_id": 1, "cantidad_a_anadir": 10},
            {"producto_id": 5, "cantidad_a_anadir": 5}
        ]
        """
        productos_data = request.data
        if not isinstance(productos_data, list):
            return Response({"error": "Se esperaba una lista de productos."}, status=status.HTTP_400_BAD_REQUEST)

        actualizados = []
        errores = []

        for item in productos_data:
            producto_id = item.get('producto_id')
            cantidad_a_anadir = item.get('cantidad_a_anadir')

            if producto_id is None or cantidad_a_anadir is None:
                errores.append({"item": item, "error": "Falta producto_id o cantidad_a_anadir."})
                continue

            if not isinstance(cantidad_a_anadir, int) or cantidad_a_anadir < 0:
                errores.append({"producto_id": producto_id, "error": "La cantidad a añadir debe ser un entero no negativo."})
                continue

            try:
                producto = Producto.objects.select_for_update().get(pk=producto_id) # Bloquear la fila para actualización
                producto.stock += cantidad_a_anadir
                producto.save()
                actualizados.append({
                    "producto_id": producto.id,
                    "nombre_producto": producto.nombre_producto,
                    "nuevo_stock": producto.stock
                })
            except Producto.DoesNotExist:
                errores.append({"producto_id": producto_id, "error": "Producto no encontrado."})
            except Exception as e:
                errores.append({"producto_id": producto_id, "error": str(e)})

        if errores:
            # Si hay errores, la transacción se revierte si alguno fue grave.
            # Decidir si devolver un error parcial o total.
            # Por ahora, devolvemos todos los errores y los actualizados (si la transacción no se revierte por completo).
            # Para una reversión completa en caso de CUALQUIER error, se necesitaría levantar una excepción dentro del bucle
            # que no sea capturada hasta fuera del @transaction.atomic o re-lanzarla.
            # O, si queremos que algunos se apliquen y otros no, no usar @transaction.atomic aquí sino transacciones por item.
            # Para "todo o nada", es mejor levantar la excepción.
            # Si queremos una reversión completa en caso de error, mejor:
            # if errores:
            #    raise serializers.ValidationError({"errores_stock": errores, "actualizados_parcial": actualizados})

            return Response({
                "mensaje": "Algunos productos no pudieron ser actualizados.",
                "errores": errores, 
                "actualizados_exitosamente": actualizados
            }, status=status.HTTP_400_BAD_REQUEST if errores else status.HTTP_200_OK)


        return Response({
            "mensaje": "Stock actualizado exitosamente para todos los productos solicitados.",
            "productos_actualizados": actualizados
        }, status=status.HTTP_200_OK)

# --- NUEVO O ASEGURAR QUE EXISTE ---
class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
# --- FIN NUEVO ---