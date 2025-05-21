# Dicaprios Backend

Este es el backend para el proyecto Dicaprios, desarrollado en Django con Django REST Framework. Proporciona una API para gestionar clientes, productos, pedidos y facturas. También implementa autenticación mediante JWT para la gestión segura de usuarios.

## Requisitos Previos

- Python 3.10 o superior
- Git
- Acceso a una base de datos (SQLite para desarrollo rápido o MySQL para producción)
- Postman (opcional, para probar la API)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd dicaprios_project
```

### 2. Instalación de Python

#### Windows

1. Descargar Python desde la [página oficial](https://www.python.org/downloads/).
2. Durante la instalación, selecciona la opción de agregar Python al `PATH`.

#### Linux

```bash
sudo apt update
sudo apt install python3 python3-pip
```

### 3. Crear un Entorno Virtual

#### Windows

```bash
python -m venv dicaprios_env
cd dicaprios_project
```

#### Linux

```bash
python3 -m venv dicaprios_env
source dicaprios_env/bin/activate
```

### 4. Activar el Entorno Virtual

#### Windows

```bash
dicaprios_env\Scripts\activate
```

#### Linux

```bash
source dicaprios_env/bin/activate
```

### 5. Instalar las Dependencias

Con el entorno virtual activado, instala las dependencias necesarias usando el archivo `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 6. Configuración de Base de Datos

#### MySQL (Opcional)

Para usar MySQL en lugar de SQLite:

1. Asegúrate de tener MySQL instalado y en funcionamiento.
2. Actualiza la configuración de la base de datos en el archivo `settings.py`.
3. Ejecuta las migraciones:

```bash
python manage.py migrate
```

### 7. Configuración CORS

Este proyecto usa `django-cors-headers` para permitir peticiones desde el frontend. En `settings.py`, puedes configurar `CORS_ALLOWED_ORIGINS` para especificar los dominios permitidos.

### 8. Crear Superusuario (para la interfaz de administración)

```bash
python manage.py createsuperuser
```

### 9. Iniciar el Servidor de Desarrollo

```bash
python manage.py runserver
```

El backend debería estar ejecutándose en `http://127.0.0.1:8000/`.

## Uso de la API

### Autenticación JWT

1. **Obtener Token**: Envía un `POST` a `/api/token/` con el `username` y `password` del usuario registrado para recibir un token de acceso y un token de refresco.

```bash
curl -X POST http://127.0.0.1:8000/api/token/ -d '{"username": "your_user", "password": "your_password"}'
```

2. **Usar el Token**: Para acceder a los endpoints protegidos, usa el token en la cabecera de autorización (`Authorization: Bearer <tu_token>`).

### Endpoints Disponibles

- **Clientes**: `/api/clientes/`
- **Productos**: `/api/productos/`
- **Pedidos**: `/api/pedidos/`
- **Facturas**: `/api/facturas/`

Estas rutas soportan operaciones CRUD, como crear, leer, actualizar y eliminar.

## Pruebas de la API

Para probar los endpoints, puedes usar **Postman** o **cURL** para enviar solicitudes **GET**, **POST**, **PUT**, y **DELETE**. Puedes consultar el paso a paso en el archivo `README.md` para probar estas operaciones.

## Notas Adicionales

Este proyecto incluye autenticación mediante JWT para garantizar la seguridad de las operaciones. Asegúrate de proteger el acceso a los tokens.