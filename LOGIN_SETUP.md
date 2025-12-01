# Flujo de Login - TheraTrack Frontend

## Descripción
Se ha implementado un flujo completo de autenticación para la aplicación Angular TheraTrack.

## Estructura de Archivos Creados

### Módulo de Login
- `src/app/pages/login/login.module.ts` - Módulo principal del login
- `src/app/pages/login/login.component.ts` - Componente principal del login
- `src/app/pages/login/login.component.html` - Template del formulario
- `src/app/pages/login/login.component.css` - Estilos del formulario

### Servicios e Interfaces
- `src/app/services/auth.service.ts` - Servicio de autenticación
- `src/app/interfaces/login-payload.interface.ts` - Interfaz para datos del login
- `src/app/interfaces/auth-response.interface.ts` - Interfaz para respuesta del servidor

## Características Implementadas

### 1. Formulario Reactivo
- Validación de email (requerido y formato válido)
- Validación de contraseña (requerida, mínimo 6 caracteres)
- Mensajes de error personalizados
- Estado de carga durante el envío

### 2. Servicio de Autenticación
- Método `login(email, password)` que hace POST a `http://localhost:3000/auth/login`
- Almacenamiento del token en localStorage
- Métodos auxiliares: `logout()`, `getToken()`, `isAuthenticated()`

### 3. Manejo de Errores
- Captura de errores de red
- Mensajes de error amigables para el usuario
- Validación de formulario en tiempo real

### 4. UI/UX Moderna
- Diseño responsive
- Gradientes y animaciones
- Estados de hover y focus
- Indicadores de carga

## Rutas Configuradas
- `/login` - Página de login (lazy loaded)
- `/` - Redirige automáticamente a `/login`

## Uso

### 1. Navegar al Login
La aplicación redirige automáticamente a `/login` al cargar.

### 2. Llenar el Formulario
- Email: Debe ser un email válido
- Contraseña: Mínimo 6 caracteres

### 3. Enviar
Al hacer clic en "Iniciar Sesión":
- Se valida el formulario
- Se hace la petición POST al servidor
- Se guarda el token en localStorage
- Se redirige a `/dashboard` (necesita ser implementado)

## Configuración del Backend

El servicio espera un endpoint en:
```
POST http://localhost:3000/auth/login
```

Con el siguiente payload:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

Y debe responder con:
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario"
  }
}
```

## Próximos Pasos

1. Implementar la página `/dashboard` para redirigir después del login
2. Crear un guard de autenticación para proteger rutas
3. Implementar interceptor HTTP para incluir el token en las peticiones
4. Agregar funcionalidad de logout
5. Implementar refresh token si es necesario

## Comandos para Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# La aplicación estará disponible en http://localhost:4200
``` 