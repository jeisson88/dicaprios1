from django.db import models
from clientes.models import Cliente
from productos.models import Producto

class Pedido(models.Model):
    # Definir opciones para el esado
    ESTADO_PENDIENTE = 'Pendiente'
    ESTADO_FACTURADO = 'Facturado'
    ESTADO_CANCELADO = 'Cancelado'
    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, 'Pendiente'),
        (ESTADO_FACTURADO, 'Facturado'),
        (ESTADO_CANCELADO, 'Cancelado'),
    ]


    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha = models.DateField(auto_now_add=True)
    estado = models.CharField(
        max_length=45,
        choices=ESTADO_CHOICES,
        default=ESTADO_PENDIENTE
    )

    def __str__(self):
        
        nombre_cliente = self.cliente.nombre if hasattr(self.cliente, 'nombre') and self.cliente.nombre else "Desconocido"
        return f'Pedido {self.id} - Cliente: {nombre_cliente} - Estado: {self.get_estado_display()}'
    

class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2) 
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f' Detalles de Pedido {self.pedido.id} - Producto {self.producto.nombre_producto}'
    
class Factura(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'Factura {self.id} - Cliente {self.cliente.nombre}'
    

class DetalleFactrua(models.Model):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'Detalles de Factura {self.factura.id} - Producto {self.producto.nombre_producto}'
