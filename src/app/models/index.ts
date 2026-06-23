// ---- Usuario ----
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isCritic: boolean; // diferencia entre usuario normal y crítico
  createdAt: string;
}

// ---- Películas / Series ----
export type MediaType = 'movie' | 'tv';

export interface CastMember {
  name: string;
  character?: string;
  photo?: string;
}

export interface Movie {
  id: string;            // id en nuestra base de datos
  tmdbId: number;        // id original en TMDB (para cachear / evitar duplicados)
  mediaType: MediaType;  // película o serie
  title: string;
  originalTitle?: string;
  overview: string;      // sinopsis
  poster?: string;       // carátula (URL completa)
  backdrop?: string;     // imagen de fondo (URL completa)
  images?: string[];     // galería de imágenes extra
  genres: string[];      // categorías (Acción, Drama, Misterio...)
  releaseDate?: string;  // fecha de publicación (ISO)
  runtime?: number;      // duración en minutos
  cast: CastMember[];    // actores
  directors?: string[];
  tmdbScore?: number;    // nota de TMDB (0-10), informativo

  // Promedios calculados a partir de las reseñas de nuestra app (0.5 - 5):
  userScore: number | null;    // promedio de usuarios normales
  userScoreCount: number;
  criticScore: number | null;  // promedio de críticos
  criticScoreCount: number;

  createdAt: string;
}

// Resultado de búsqueda en la API externa (aún no está en nuestra DB)
export interface TmdbResult {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  poster?: string;
  releaseDate?: string;
  tmdbScore?: number;
  inLibrary?: boolean;   // true si ya existe en nuestra DB
  localId?: string;      // id local si ya existe
}

// ---- Reseñas / Comentarios ----
export interface ReviewAuthor {
  id: string;
  name: string;
  avatar?: string;
  isCritic: boolean;
}

export interface Review {
  id: string;
  movieId: string;
  userId: string;
  author?: ReviewAuthor;
  rating: number;     // 0.5 - 5 (incrementos de 0.5)
  text: string;       // opinión
  isCritic: boolean;  // rol del autor al momento de la reseña
  createdAt: string;
  updatedAt?: string;
}

// Reseña con resumen de la película (para "Mis Reseñas")
export interface MyReview extends Review {
  movie?: {
    id: string;
    title: string;
    poster?: string;
    mediaType: MediaType;
    releaseDate?: string;
  };
}

// ---- Filtros del catálogo ----
export type SortKey = 'score' | 'date' | 'title';
export type TypeFilter = 'all' | 'movie' | 'tv';

export interface MovieFilters {
  search?: string;
  genre?: string;
  type?: MediaType;
  year?: number;
  minScore?: number;
  sort?: SortKey;
}
