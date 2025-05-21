from django.db import models

class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.CharField(max_length=45)
    telefono = models.IntegerField()
    direccion = models.CharField(max_length=100)

    def __srt__ (self):
        return self.nombre
