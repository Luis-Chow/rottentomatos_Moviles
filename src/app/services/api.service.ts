import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User, Movie, Review, MyReview, TmdbResult, MediaType, MovieFilters,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = (environment.apiUrl?.replace(/\/$/, '') || 'http://localhost:4000') + '/api';

  get baseUrl(): string {
    return this.base;
  }

  // ---- Auth ----
  register(name: string, email: string, password: string, isCritic = false): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.base}/auth/register`, { name, email, password, isCritic });
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.base}/auth/login`, { email, password });
  }

  // ---- Usuarios (CRUD) ----
  getMe(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.base}/users/me`);
  }

  updateMe(
    updates: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'isCritic'>> & { password?: string; currentPassword?: string }
  ): Observable<{ user: User }> {
    return this.http.patch<{ user: User }>(`${this.base}/users/me`, updates);
  }

  deleteMe(): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/users/me`);
  }

  // ---- Catálogo ----
  listMovies(filters?: MovieFilters): Observable<{ movies: Movie[] }> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.genre) params = params.set('genre', filters.genre);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.year) params = params.set('year', String(filters.year));
    if (filters?.minScore) params = params.set('minScore', String(filters.minScore));
    if (filters?.sort) params = params.set('sort', filters.sort);
    return this.http.get<{ movies: Movie[] }>(`${this.base}/movies`, { params });
  }

  getMovie(id: string): Observable<{ movie: Movie }> {
    return this.http.get<{ movie: Movie }>(`${this.base}/movies/${id}`);
  }

  // ---- API externa (TMDB) ----
  searchTmdb(query: string, type?: MediaType): Observable<{ results: TmdbResult[] }> {
    let params = new HttpParams().set('q', query);
    if (type) params = params.set('type', type);
    return this.http.get<{ results: TmdbResult[] }>(`${this.base}/tmdb/search`, { params });
  }

  importMovie(tmdbId: number, mediaType: MediaType): Observable<{ movie: Movie }> {
    return this.http.post<{ movie: Movie }>(`${this.base}/tmdb/import`, { tmdbId, mediaType });
  }

  // ---- Reseñas / Comentarios (CRUD) ----
  listReviews(movieId: string): Observable<{ reviews: Review[] }> {
    return this.http.get<{ reviews: Review[] }>(`${this.base}/movies/${movieId}/reviews`);
  }

  listMyReviews(): Observable<{ reviews: MyReview[] }> {
    return this.http.get<{ reviews: MyReview[] }>(`${this.base}/reviews/mine`);
  }

  createReview(movieId: string, data: { rating: number; text: string }): Observable<{ review: Review; movie: Movie }> {
    return this.http.post<{ review: Review; movie: Movie }>(`${this.base}/movies/${movieId}/reviews`, data);
  }

  updateReview(id: string, updates: { rating?: number; text?: string }): Observable<{ review: Review; movie: Movie }> {
    return this.http.patch<{ review: Review; movie: Movie }>(`${this.base}/reviews/${id}`, updates);
  }

  deleteReview(id: string): Observable<{ ok: true; movie: Movie }> {
    return this.http.delete<{ ok: true; movie: Movie }>(`${this.base}/reviews/${id}`);
  }
}
