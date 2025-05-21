from django.db import models

class Categoria(models.Model):
    nombre_categoria = models.CharField(max_length=45)

    def __str__(self):
        return self.nombre_categoria
    
class Producto(models.Model):
    nombre_producto = models.CharField(max_length=45)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    talla = models.IntegerField()
    color = models.CharField(max_length=45)
    stock = models.IntegerField()
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre_producto
    
class Proveedor(models.Model):
    nombre_proveedor = models.CharField(max_length=45)
    contacto = models.CharField(max_length=45)
    telefono = models.IntegerField()
    direccion = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre_proveedor
