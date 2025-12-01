# Configuración de Variables de Entorno

El frontend de TheraTrack ahora usa variables de entorno para configurar la URL de la API del backend.

## Archivos de Entorno

### Desarrollo (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### Producción (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://theratrack-backend.onrender.com'
};
```

## Cómo Funciona

- **Desarrollo**: Cuando ejecutas `ng serve`, se usa `environment.ts` (localhost:3000)
- **Producción**: Cuando ejecutas `ng build --configuration production`, Angular reemplaza automáticamente `environment.ts` con `environment.prod.ts`

## Cambiar la URL de la API

### Para Desarrollo Local

Edita `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://tu-backend-local:3000'  // Cambia aquí
};
```

### Para Producción

Edita `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-produccion.com'  // Cambia aquí
};
```

## Servicios Actualizados

Todos los servicios ahora usan `environment.apiUrl`:

- ✅ `AuthService` - `${environment.apiUrl}/auth`
- ✅ `SessionsService` - `${environment.apiUrl}/sessions`
- ✅ `PatientService` - `${environment.apiUrl}/patients`
- ✅ `PatientsService` - `${environment.apiUrl}/patients`
- ✅ `TranscriptionService` - `${environment.apiUrl}/transcriptions`
- ✅ `AiAnalysisService` - `${environment.apiUrl}/ai-analysis`
- ✅ `UsersService` - `${environment.apiUrl}/users`

## Build y Deploy

### Build para Desarrollo
```bash
ng build
# Usa environment.ts (localhost:3000)
```

### Build para Producción
```bash
ng build --configuration production
# Usa environment.prod.ts (theratrack-backend.onrender.com)
```

## Notas

- Los archivos de entorno están en TypeScript, no en `.env` (esto es normal en Angular)
- Angular reemplaza automáticamente los archivos según la configuración de build
- No necesitas cambiar código en los servicios, solo edita los archivos de entorno

