from django.db import models

class Categoria(models.Model):
    nombre_categoria = models.CharField(max_length=45)

    def __str__(self):
        return self.nombre_categoria
    
class Proveedor(models.Model): # Movido aquí para que Producto pueda referenciarlo
    nombre_proveedor = models.CharField(max_length=45, unique=True) # unique=True es buena idea
    contacto = models.CharField(max_length=45, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True) # Cambiado a CharField
    direccion = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.nombre_proveedor

class Producto(models.Model):
    nombre_producto = models.CharField(max_length=45)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    talla = models.CharField(max_length=10, blank=True, null=True) # Talla puede ser S, M, L, etc.
    color = models.CharField(max_length=45)
    stock = models.IntegerField()
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True) # Cambiado a SET_NULL
    
    # --- NUEVO CAMPO ---
    proveedor = models.ForeignKey(
        Proveedor, 
        on_delete=models.SET_NULL, # Si se borra un proveedor, el campo en Producto se vuelve NULL
        null=True,                 # Permite que el campo sea NULL en la base de datos
        blank=True,                # Permite que el campo esté vacío en formularios/admin
        related_name='productos'   # Nombre para la relación inversa desde Proveedor
    )
    # --- FIN NUEVO CAMPO ---
    imagen = models.ImageField(upload_to='productos_imagenes/', blank=True, null=True)

    def __str__(self):
        return self.nombre_producto