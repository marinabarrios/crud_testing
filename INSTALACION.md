# 🚀 Instalación Rápida - Tienda CRUD

## 📋 Requisitos Previos

- **Python 3.8+** instalado
- **Node.js 18+** instalado
- **Git** instalado

## ⚡ Instalación en 5 Pasos

### 1. Clonar el Proyecto
```bash
git clone <tu-repositorio>
cd Crud
```

### 2. Configurar Backend Django
```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
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

# Ejecutar servidor
python manage.py runserver
```

### 3. Configurar Frontend Next.js
```bash
cd ../frontend

# Instalar dependencias
npm install

# Ejecutar servidor
npm run dev
```

### 4. Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

### 5. ¡Listo! 🎉
Tu tienda CRUD está funcionando con:
- ✅ Backend Django con API REST
- ✅ Frontend Next.js con Tailwind CSS
- ✅ Carrito de compras funcional
- ✅ Gestión de productos y usuarios

## 🔧 Comandos Útiles

### Backend
```bash
# Verificar estado
python manage.py check

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Shell de Django
python manage.py shell

# Tests
python manage.py test
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Servidor de producción
npm start

# Linting
npm run lint
```

## 🐛 Solución de Problemas

### Error: Puerto en uso
```bash
# Cambiar puerto del backend
python manage.py runserver 8001

# Cambiar puerto del frontend
npm run dev -- -p 3001
```

### Error: Dependencias no encontradas
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: Base de datos
```bash
# Eliminar base de datos y recrear
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 📱 Funcionalidades Disponibles

- **Productos**: CRUD completo con categorías
- **Usuarios**: Registro, login y perfiles
- **Carrito**: Agregar, remover y modificar productos
- **Pedidos**: Historial y gestión de compras
- **Admin**: Panel de administración completo

## 🌐 Endpoints de la API

- `GET /api/products/` - Listar productos
- `POST /api/products/` - Crear producto
- `GET /api/categories/` - Listar categorías
- `POST /api/users/register/` - Registro de usuario
- `POST /api/users/login/` - Login de usuario
- `GET /api/cart/my_cart/` - Obtener carrito
- `POST /api/cart/add_item/` - Agregar al carrito

## 🎯 Próximos Pasos

1. **Personalizar estilos** en `frontend/src/app/globals.css`
2. **Agregar más productos** desde el admin de Django
3. **Implementar autenticación JWT** para producción
4. **Agregar validaciones** de formularios
5. **Implementar tests** automatizados

¡Disfruta desarrollando tu tienda CRUD! 🛍️
