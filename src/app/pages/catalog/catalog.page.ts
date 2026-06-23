import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent,
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonChip, IonInput,
  IonCard, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { DataService } from '../../services/data.service';
import { Movie, SortKey, TypeFilter } from '../../models';
import { GENRES, genreMatches } from '../../constants/genres';
import { StarRatingComponent } from '../../components/star-rating.component';

// Promedio global combinando usuarios + críticos (null si no hay reseñas)
export function overallScore(m: Movie): number | null {
  const total = m.userScoreCount + m.criticScoreCount;
  if (total === 0) return null;
  return ((m.userScore ?? 0) * m.userScoreCount + (m.criticScore ?? 0) * m.criticScoreCount) / total;
}

const MIN_SCORE_OPTIONS = [
  { label: 'Todos', value: 0 },
  { label: '★3+', value: 3 },
  { label: '★3.5+', value: 3.5 },
  { label: '★4+', value: 4 },
  { label: '★4.5+', value: 4.5 },
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonChip, IonInput,
    IonCard, IonRefresher, IonRefresherContent, StarRatingComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>🎬 Catálogo</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="showFilters.set(!showFilters())" [color]="activeFilterCount() ? 'primary' : undefined">
            <ion-icon slot="start" name="funnel-outline"></ion-icon>
            {{ activeFilterCount() || '' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          placeholder="Buscar por nombre..."
          [debounce]="150"
          (ionInput)="search.set($any($event.target).value || '')"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="bar">
        <ion-segment [value]="sort()" (ionChange)="sort.set($any($event.detail.value))">
          <ion-segment-button value="score"><ion-label>Puntuación</ion-label></ion-segment-button>
          <ion-segment-button value="date"><ion-label>Fecha</ion-label></ion-segment-button>
          <ion-segment-button value="title"><ion-label>A-Z</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      @if (showFilters()) {
        <div class="filters">
          <p class="ftitle">Tipo</p>
          <ion-segment [value]="type()" (ionChange)="type.set($any($event.detail.value))">
            <ion-segment-button value="all"><ion-label>Todas</ion-label></ion-segment-button>
            <ion-segment-button value="movie"><ion-label>Películas</ion-label></ion-segment-button>
            <ion-segment-button value="tv"><ion-label>Series</ion-label></ion-segment-button>
          </ion-segment>

          <p class="ftitle">Puntuación mínima</p>
          <div class="chips">
            @for (opt of minScoreOptions; track opt.value) {
              <ion-chip [color]="minScore() === opt.value ? 'primary' : 'medium'" (click)="minScore.set(opt.value)">{{ opt.label }}</ion-chip>
            }
          </div>

          <p class="ftitle">Año</p>
          <ion-input
            class="year" fill="outline" type="number" inputmode="numeric" placeholder="Ej. 2023"
            [value]="year()" (ionInput)="setYear($any($event.target).value)"
          ></ion-input>

          <p class="ftitle">Categorías</p>
          <div class="chips">
            @for (g of genres; track g) {
              <ion-chip [color]="selectedGenres().includes(g) ? 'primary' : 'medium'" (click)="toggleGenre(g)">{{ g }}</ion-chip>
            }
          </div>
        </div>
      }

      @if (filtered().length === 0) {
        <div class="empty">
          <div class="emoji">🍿</div>
          @if (data.movies().length === 0) {
            <p>Tu catálogo está vacío</p>
            <ion-button (click)="goSearch()">🔎 Buscar títulos</ion-button>
          } @else {
            <p>Sin resultados con esos filtros</p>
          }
        </div>
      } @else {
        <div class="list">
          @for (m of filtered(); track m.id) {
            <ion-card button class="movie" (click)="open(m)">
              <div class="row">
                @if (m.poster) {
                  <img [src]="m.poster" alt="poster" class="poster" />
                } @else {
                  <div class="poster empty-poster">🎬</div>
                }
                <div class="info">
                  <h2>{{ m.title }}</h2>
                  <div class="meta">
                    <span class="badge">{{ m.mediaType === 'tv' ? 'Serie' : 'Película' }}</span>
                    @if (m.releaseDate) { <span class="year-txt">{{ m.releaseDate.slice(0, 4) }}</span> }
                  </div>
                  @if (m.genres.length) { <p class="genres">{{ m.genres.slice(0, 3).join(' · ') }}</p> }
                  <div class="scores">
                    <span class="score">
                      <span class="ico" style="color: var(--app-user-color)">👤</span>
                      <app-star-rating [value]="m.userScore || 0" [size]="12" color="#21d07a"></app-star-rating>
                      <span class="num">{{ m.userScore != null ? m.userScore.toFixed(1) : '–' }}</span>
                    </span>
                    <span class="score">
                      <span class="ico" style="color: var(--app-critic-color)">🎬</span>
                      <app-star-rating [value]="m.criticScore || 0" [size]="12" color="#f5c518"></app-star-rating>
                      <span class="num">{{ m.criticScore != null ? m.criticScore.toFixed(1) : '–' }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </ion-card>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .bar { padding: 8px 12px 0; }
    .filters { padding: 4px 14px 8px; background: var(--ion-color-step-100, #1f2937); margin: 8px 12px; border-radius: 12px; }
    .ftitle { font-size: 13px; font-weight: 700; margin: 10px 0 6px; }
    .chips { display: flex; flex-wrap: wrap; gap: 2px; }
    .year { max-width: 140px; }
    .list { padding: 8px 12px 24px; display: flex; flex-direction: column; gap: 10px; }
    .movie { margin: 0; border-radius: 14px; }
    .row { display: flex; gap: 12px; padding: 12px; }
    .poster { width: 64px; height: 96px; border-radius: 8px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-poster { display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .info { flex: 1; min-width: 0; }
    .info h2 { font-size: 16px; font-weight: 700; margin: 0; }
    .meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .badge { font-size: 10px; font-weight: 700; background: var(--ion-color-step-150, #374151); border-radius: 6px; padding: 2px 6px; }
    .year-txt { font-size: 12px; color: var(--ion-color-medium); }
    .genres { font-size: 12px; color: var(--ion-color-medium); margin: 4px 0 0; }
    .scores { display: flex; gap: 14px; margin-top: 8px; }
    .score { display: flex; align-items: center; gap: 4px; }
    .ico { font-size: 12px; }
    .num { font-size: 12px; font-weight: 700; }
    .empty { text-align: center; padding: 60px 24px; color: var(--ion-color-medium); }
    .empty .emoji { font-size: 48px; margin-bottom: 12px; }
  `],
})
export class CatalogPage {
  data = inject(DataService);
  private router = inject(Router);

  readonly genres = GENRES;
  readonly minScoreOptions = MIN_SCORE_OPTIONS;

  search = signal('');
  sort = signal<SortKey>('score');
  type = signal<TypeFilter>('all');
  selectedGenres = signal<string[]>([]);
  minScore = signal(0);
  year = signal('');
  showFilters = signal(false);

  activeFilterCount = computed(() =>
    (this.type() !== 'all' ? 1 : 0) +
    this.selectedGenres().length +
    (this.minScore() > 0 ? 1 : 0) +
    (this.year().trim() ? 1 : 0)
  );

  filtered = computed<Movie[]>(() => {
    let list = [...this.data.movies()];
    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) => m.title.toLowerCase().includes(q) || (m.originalTitle || '').toLowerCase().includes(q)
      );
    }
    if (this.type() !== 'all') list = list.filter((m) => m.mediaType === this.type());
    const genres = this.selectedGenres();
    if (genres.length) list = list.filter((m) => genreMatches(m.genres, genres));
    if (this.minScore() > 0) {
      list = list.filter((m) => {
        const s = overallScore(m);
        return s != null && s >= this.minScore();
      });
    }
    const y = this.year().trim();
    if (y) list = list.filter((m) => (m.releaseDate || '').slice(0, 4) === y);

    const sort = this.sort();
    list.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
      if (sort === 'date') return (b.releaseDate || '').localeCompare(a.releaseDate || '');
      const sa = overallScore(a);
      const sb = overallScore(b);
      if (sa == null && sb == null) return a.title.localeCompare(b.title);
      if (sa == null) return 1;
      if (sb == null) return -1;
      return sb - sa;
    });
    return list;
  });

  ionViewWillEnter(): void {
    this.data.refresh();
  }

  toggleGenre(g: string): void {
    this.selectedGenres.update((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  setYear(value: string | null | undefined): void {
    this.year.set((value || '').replace(/\D/g, '').slice(0, 4));
  }

  open(m: Movie): void {
    this.router.navigate(['/movies', m.id]);
  }

  goSearch(): void {
    this.router.navigateByUrl('/tabs/search');
  }

  async doRefresh(ev: CustomEvent): Promise<void> {
    await this.data.refresh();
    (ev.target as HTMLIonRefresherElement).complete();
  }
}
