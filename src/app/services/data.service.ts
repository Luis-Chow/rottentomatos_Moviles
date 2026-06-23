import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Movie, MyReview, MediaType } from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private api = inject(ApiService);

  readonly movies = signal<Movie[]>([]);
  readonly myReviews = signal<MyReview[]>([]);
  readonly loading = signal(false);

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const [m, r] = await Promise.all([
        firstValueFrom(this.api.listMovies()),
        firstValueFrom(this.api.listMyReviews()),
      ]);
      this.movies.set(m.movies);
      this.myReviews.set(r.reviews);
    } catch (e) {
      console.warn('[data] refresh falló:', e);
    } finally {
      this.loading.set(false);
    }
  }

  // Inserta o actualiza una película en el catálogo en memoria.
  upsertMovie(movie: Movie): void {
    this.movies.update((prev) => {
      const idx = prev.findIndex((m) => m.id === movie.id);
      if (idx === -1) return [movie, ...prev];
      const copy = [...prev];
      copy[idx] = movie;
      return copy;
    });
  }

  async importMovie(tmdbId: number, mediaType: MediaType): Promise<Movie> {
    const { movie } = await firstValueFrom(this.api.importMovie(tmdbId, mediaType));
    this.upsertMovie(movie);
    return movie;
  }

  private async refreshMyReviews(): Promise<void> {
    try {
      const { reviews } = await firstValueFrom(this.api.listMyReviews());
      this.myReviews.set(reviews);
    } catch (e) {
      console.warn('[data] refresh mis reseñas falló:', e);
    }
  }

  async createReview(movieId: string, data: { rating: number; text: string }): Promise<void> {
    const { movie } = await firstValueFrom(this.api.createReview(movieId, data));
    this.upsertMovie(movie);
    await this.refreshMyReviews();
  }

  async updateReview(id: string, data: { rating?: number; text?: string }): Promise<void> {
    const { movie } = await firstValueFrom(this.api.updateReview(id, data));
    this.upsertMovie(movie);
    await this.refreshMyReviews();
  }

  async deleteReview(id: string): Promise<void> {
    const { movie } = await firstValueFrom(this.api.deleteReview(id));
    this.upsertMovie(movie);
    this.myReviews.update((list) => list.filter((r) => r.id !== id));
  }

  clear(): void {
    this.movies.set([]);
    this.myReviews.set([]);
  }
}
