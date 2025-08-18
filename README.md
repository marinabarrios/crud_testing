# Tienda Online CRUD - Frontend Next.js + Backend Django

Sistema completo de tienda online con gestión de productos, carrito de compras y gestión de usuarios.

## 🏗️ Estructura del Proyecto

```
Crud/
├── backend/                 # API Django REST Framework
│   ├── tienda_backend/     # Configuración principal de Django
│   ├── products/           # Aplicación de productos
│   ├── users/              # Aplicación de usuarios
│   ├── cart/               # Aplicación del carrito
│   └── requirements.txt    # Dependencias de Python
└── frontend/               # Frontend Next.js
    ├── src/
    │   ├── app/            # Páginas de la aplicación
    │   ├── components/     # Componentes React
    │   ├── types/          # Tipos TypeScript
    │   └── lib/            # Utilidades y servicios
    ├── package.json        # Dependencias de Node.js
    └── tailwind.config.js  # Configuración de Tailwind CSS
```

## 🚀 Características

### Backend (Django)
- ✅ API REST completa con Django REST Framework
- ✅ Modelos: Usuario, Producto, Categoría, Carrito, Pedido
- ✅ Autenticación con tokens
- ✅ Gestión de usuarios y perfiles
- ✅ CRUD completo de productos
- ✅ Sistema de carrito de compras
- ✅ Gestión de pedidos
- ✅ Admin de Django configurado
- ✅ CORS configurado para desarrollo

### Frontend (Next.js)
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Componentes React reutilizables
- ✅ Gestión de estado local
- ✅ Carrito de compras funcional
- ✅ Diseño responsive
- ✅ Tipos TypeScript completos

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 18+ (para el frontend)
- pip (gestor de paquetes de Python)
- npm o yarn (gestores de paquetes de Node.js)

## 🔧 Instalación y Configuración

### 1. Backend Django

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver
```

El backend estará disponible en: http://localhost:8000
Admin de Django: http://localhost:8000/admin
API: http://localhost:8000/api/

### 2. Frontend Next.js

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## 🗄️ Endpoints de la API

### Productos
- `GET /api/products/` - Listar productos
- `POST /api/products/` - Crear producto
- `GET /api/products/{id}/` - Obtener producto
- `PUT /api/products/{id}/` - Actualizar producto
- `DELETE /api/products/{id}/` - Eliminar producto
- `GET /api/products/search/?q={query}` - Buscar productos

### Categorías
- `GET /api/categories/` - Listar categorías
- `POST /api/categories/` - Crear categoría
- `GET /api/categories/{id}/products/` - Productos por categoría

### Usuarios
- `POST /api/users/register/` - Registro de usuario
- `POST /api/users/login/` - Inicio de sesión
- `GET /api/users/me/` - Perfil del usuario actual

### Carrito
- `GET /api/cart/my_cart/` - Obtener carrito del usuario
- `POST /api/cart/add_item/` - Agregar producto al carrito
- `POST /api/cart/remove_item/` - Remover producto del carrito
- `POST /api/cart/checkout/` - Finalizar compra

### Pedidos
- `GET /api/orders/` - Listar pedidos del usuario

## 🎯 Funcionalidades Principales

### Gestión de Productos
- Listado de productos con filtros
- Búsqueda de productos
- Gestión de stock
- Categorización de productos
- Imágenes de productos

### Carrito de Compras
- Agregar/remover productos
- Modificar cantidades
- Cálculo automático de totales
- Persistencia de sesión

### Gestión de Usuarios
- Registro e inicio de sesión
- Perfiles de usuario
- Historial de pedidos
- Gestión de direcciones

### Panel de Administración
- Gestión completa de productos
- Gestión de usuarios
- Monitoreo de pedidos
- Estadísticas de ventas

## 🛠️ Desarrollo

### Estructura de Componentes Frontend

- `Header` - Navegación principal y carrito
- `ProductGrid` - Grid de productos
- `ProductCard` - Tarjeta individual de producto
- `Cart` - Componente del carrito de compras

### Estado de la Aplicación

El frontend utiliza estado local de React para:
- Productos en el carrito
- Estado del modal del carrito
- Filtros y búsquedas

### Estilos

- Tailwind CSS para estilos utilitarios
- Componentes personalizados con clases CSS
- Diseño responsive para móvil y desktop
- Tema personalizable con variables CSS

## 🚀 Despliegue

### Backend
```bash
# Configurar variables de entorno para producción
# Configurar base de datos PostgreSQL/MySQL
# Configurar archivos estáticos
python manage.py collectstatic
python manage.py migrate
gunicorn tienda_backend.wsgi:application
```

### Frontend
```bash
npm run build
npm start
# O usar servicios como Vercel, Netlify, etc.
```

## 📝 Notas de Desarrollo

- El frontend actualmente usa datos mock para demostración
- Para conectar con el backend real, actualizar las URLs en los servicios
- Implementar autenticación JWT para producción
- Agregar validaciones de formularios más robustas
- Implementar manejo de errores más detallado

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
- Revisar la documentación de Django y Next.js
- Verificar que todas las dependencias estén instaladas
- Comprobar que los puertos 8000 y 3000 estén disponibles
- Revisar los logs del servidor para errores específicos
