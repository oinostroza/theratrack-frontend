# Configuración de Despliegue en Netlify

Esta guía explica cómo desplegar TheraTrack Frontend en Netlify.

## Configuración Automática

El proyecto ya está configurado con:
- ✅ Archivo `_redirects` para manejar rutas de SPA
- ✅ Archivo `netlify.toml` para configuración de Netlify
- ✅ Variables de entorno configuradas

## Configuración en Netlify

### 1. Build Settings

En el dashboard de Netlify, configura:

- **Build command**: `npm run build -- --configuration production`
- **Publish directory**: `dist/theratrack-frontend`

### 2. Variables de Entorno (Opcional)

Si necesitas cambiar la URL de la API en producción, puedes agregar variables de entorno en Netlify, pero es más fácil editar `src/environments/environment.prod.ts` directamente.

### 3. Archivo _redirects

El archivo `src/_redirects` se copia automáticamente al build y contiene:
```
/*    /index.html   200
```

Esto asegura que todas las rutas de Angular se redirijan a `index.html` para que el routing funcione correctamente.

## Solución de Problemas

### Error 404 en todas las rutas

**Problema**: Netlify muestra "Page not found" para rutas como `/login`, `/usuarios`, etc.

**Solución**: 
1. Verifica que el archivo `_redirects` esté en `src/_redirects`
2. Verifica que esté incluido en `angular.json` en la sección `assets`
3. El archivo debe copiarse a la raíz del `dist/theratrack-frontend` después del build

### El login no se muestra

**Problema**: Al acceder a la raíz `/`, no se muestra el login.

**Causas posibles**:
1. El `AuthGuard` está redirigiendo pero hay un problema con el routing
2. El archivo `_redirects` no está funcionando
3. Hay un error de JavaScript que impide que Angular se cargue

**Solución**:
1. Abre la consola del navegador (F12) y revisa errores
2. Verifica que `index.html` se esté sirviendo correctamente
3. Verifica que el build se haya completado sin errores

### Verificar que _redirects esté en el build

Después del build, verifica que el archivo esté presente:

```bash
ls -la dist/theratrack-frontend/_redirects
```

Si no está, el archivo no se está copiando correctamente.

## Estructura de Rutas

- `/` → Redirige a `/login` si no hay token, o a `/usuarios` si hay token
- `/login` → Página de login
- `/usuarios` → Dashboard (requiere autenticación)
- `/pacientes` → Gestión de pacientes (requiere autenticación)
- `/sesiones` → Gestión de sesiones (requiere autenticación)
- etc.

## Notas Importantes

- El `AuthGuard` busca el token en `localStorage.getItem('access_token')`
- El `AuthService` guarda el token automáticamente después del login
- Todas las rutas protegidas requieren autenticación

