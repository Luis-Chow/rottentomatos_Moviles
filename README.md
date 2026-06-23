# 🍅 RottenTomatos — App de reseñas de Películas y Series

App móvil hecha con **Ionic + Angular** (standalone) estilo Rotten Tomatoes / Letterboxd.
Consume un backend **Express + MongoDB + JWT** (carpeta `../rotten-tomatos-backend`),
que a su vez usa **TMDB** como API externa de películas/series reales.

> Estado: **frontend completo**. El backend está como carpeta scaffold (siguiente fase).
> Mientras no exista el backend, las pantallas que llaman a la API mostrarán
> "No se pudo conectar con el servidor".

## Requisitos del enunciado y dónde se cumplen

| Requisito | Dónde |
|---|---|
| CRUD Usuarios | `pages/login`, `pages/register`, `pages/profile` (editar/eliminar) |
| CRUD Comentarios (opinión + puntaje) | `pages/review-form`, `pages/my-reviews`, reseñas en `pages/movie-detail` |
| Filtro / Sorting | `pages/catalog`: búsqueda por nombre, categorías, año, puntaje; orden por puntuación / fecha / título |
| API externa + cache en DB propia | `pages/search` → TMDB vía backend (`/tmdb/search`, `/tmdb/import`) |
| Info de la película | `pages/movie-detail`: sinopsis, fecha, actores, carátula + galería, géneros, duración |
| Puntaje de usuarios + diferencia Usuarios/Críticos | `components/score-badge` (dos promedios), flag `isCritic` |

## Cómo correr

```bash
npm install
npm start            # = ng serve  →  http://localhost:8100 (o 4200)
# o con Ionic CLI:
# ionic serve
```

### Configurar el backend
Edita `src/environments/environment.ts` y pon la URL del backend en `apiUrl`
(SIN `/api` al final). Vacío => `http://localhost:4000`.

```ts
export const environment = { production: false, apiUrl: '' };
```

### Generar APK (Capacitor)
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android   # build del APK desde Android Studio
```

## Estructura

```
src/
  app/
    components/   star-rating, score-badge
    constants/    genres.ts (categorías + normalización de acentos)
    guards/       auth.guard.ts (authGuard / guestGuard)
    models/       index.ts (interfaces)
    pages/        login, register, tabs, catalog, search,
                  movie-detail, review-form, my-reviews, profile
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
