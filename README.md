# 🍅 RottenTomatos — App de reseñas de Películas y Series

App móvil hecha con **Ionic + Angular** (standalone) estilo Rotten Tomatoes / Letterboxd.
Consume un backend **Express + MongoDB + JWT** (carpeta `../rotten-tomatos-backend`),
que a su vez usa **TMDB** como API externa de películas/series reales.

## Requisitos del enunciado y dónde se cumplen

| Requisito | Dónde |
|---|---|
| CRUD Usuarios | `pages/login`, `pages/register`, `pages/profile` (editar/eliminar) |
| CRUD Comentarios (opinión + puntaje) | `pages/review-form`, `pages/my-reviews`, reseñas en `pages/movie-detail` |
| Filtro / Sorting | `pages/catalog`: búsqueda por nombre, categorías, año, puntaje; orden por puntuación / fecha / título |
| API externa + cache en DB propia | `pages/search` → TMDB vía backend (`/tmdb/search`, `/tmdb/import`) |
| Info de la película | `pages/movie-detail`: sinopsis, fecha, actores, carátula + galería, géneros, duración |
| Puntaje de usuarios + diferencia Usuarios/Críticos | `components/score-badge` (dos promedios), flag `isCritic` |
| Perfil público de usuarios (sus reseñas) | `pages/user-profile` (ruta `/users/:id`, enlazado desde cada reseña) |
| Perfil de actor con filmografía (TMDB) | `pages/person` (ruta `/person`, enlazado desde el reparto) |

## Cómo correr

```bash
npm install
npm start            # = ng serve  →  http://localhost:8100 (o 4200)
# o con Ionic CLI:
# ionic serve
```

### Configurar el backend
La URL del backend se define en `src/environments/environment.ts` (desarrollo)
y `environment.prod.ts` (build de producción / APK), campo `apiUrl` sin `/api`
al final. Vacío equivale a `http://localhost:4000`.

```ts
export const environment = { production: false, apiUrl: '' };
```

### Generar APK (Capacitor)
```bash
build-apk.cmd   # Angular build + Capacitor sync + Gradle assembleDebug
```
Requiere JDK 21 y Android SDK en `%LOCALAPPDATA%\Android`. El APK queda en
`android/app/build/outputs/apk/debug/app-debug.apk`.

## Estructura

```
src/
  app/
    components/   star-rating, score-badge, expandable-text
    constants/    genres.ts (categorías + normalización de acentos)
    guards/       auth.guard.ts (authGuard / guestGuard)
    models/       index.ts (interfaces)
    pages/        login, register, tabs, catalog, search, movie-detail,
                  review-form, my-reviews, profile, user-profile, person
    services/     api.service, auth.service, data.service, auth.interceptor
    utils/        error.ts
    app.routes.ts, app.component.ts
  environments/   environment(.prod).ts
  theme/          variables.scss (acento tomate + dorado/verde)
  global.scss     Ionic core + tema oscuro forzado
```

## Sistema de puntajes
- Reseñas con estrellas de **0.5 a 5** (medias estrellas; el toque calcula el valor por posición).
- Cada título muestra **dos promedios separados**: 👤 Usuarios y 🎬 Críticos, según el
  flag `isCritic` del autor de cada reseña.
