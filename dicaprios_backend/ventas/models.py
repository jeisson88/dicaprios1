from django.db import models
from clientes.models import Cliente
from productos.models import Producto

class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=45)

    def __str__(self):
        return f'Pedido {self.id} - {self.cliente.nombre}'
    

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
