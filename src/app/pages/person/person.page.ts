import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonCard, IonSpinner, IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { Person, PersonCredit } from '../../models';
import { httpErrorMessage } from '../../utils/error';
import { ExpandableTextComponent } from '../../components/expandable-text.component';

// Perfil de un actor (datos de TMDB) con las películas/series donde aparece.
// Se abre con ?id=<tmdbPersonId> y/o ?name=<nombre> desde el reparto de un título.
@Component({
  selector: 'app-person',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
    IonCard, IonSpinner, IonIcon, ExpandableTextComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/catalog"></ion-back-button></ion-buttons>
        <ion-title>{{ person()?.name || nameParam || 'Actor' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div class="center"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (!person()) {
        <div class="center">
          <div class="emoji">🎭</div>
          <p>{{ error() || 'Actor no encontrado' }}</p>
        </div>
      } @else {
        @let p = person()!;

        <div class="head">
          @if (p.photo) { <img class="photo" [src]="p.photo" alt="foto" /> }
          @else { <div class="photo empty-photo">🎭</div> }
          <h1>{{ p.name }}</h1>
          <div class="meta">
            @if (p.knownFor === 'Acting') { <span>🎭 Actuación</span> }
            @else if (p.knownFor) { <span>🎬 {{ p.knownFor }}</span> }
            @if (p.birthday) { <span>· 🎂 {{ formatDate(p.birthday) }}</span> }
            @if (p.deathday) { <span>· ✝ {{ formatDate(p.deathday) }}</span> }
          </div>
          @if (p.placeOfBirth) { <p class="place">📍 {{ p.placeOfBirth }}</p> }
        </div>

        @if (p.biography) {
          <div class="section">
            <h3 class="app-section-title">📖 Biografía</h3>
            <app-expandable-text [text]="p.biography" [limit]="350"></app-expandable-text>
          </div>
        }

        <div class="section">
          <h3 class="app-section-title">🎬 Filmografía ({{ p.credits.length }})</h3>
          @if (p.credits.length === 0) {
            <p class="app-muted">No se encontraron títulos.</p>
          } @else {
            @for (c of p.credits; track c.mediaType + '-' + c.tmdbId) {
              <ion-card button class="item" (click)="open(c)">
                <div class="row">
                  @if (c.poster) { <img class="poster" [src]="c.poster" alt="poster" /> }
                  @else { <div class="poster empty-poster">🎬</div> }
                  <div class="info">
                    <h2>{{ c.title }}</h2>
                    <div class="cmeta">
                      <span class="badge">{{ c.mediaType === 'tv' ? 'Serie' : 'Película' }}</span>
                      @if (c.releaseDate) { <span>{{ c.releaseDate.slice(0, 4) }}</span> }
                      @if (c.tmdbScore) { <span>★ {{ c.tmdbScore.toFixed(1) }}</span> }
                    </div>
                    @if (c.character) { <p class="char">como {{ c.character }}</p> }
                    @if (c.inLibrary) {
                      <p class="lib"><ion-icon name="checkmark-circle"></ion-icon> En tu catálogo</p>
                    } @else {
                      <p class="imp">{{ importingId() === c.tmdbId ? 'Importando…' : '+ Tocar para añadir y ver' }}</p>
                    }
                  </div>
                  @if (importingId() === c.tmdbId) { <ion-spinner name="crescent"></ion-spinner> }
                </div>
              </ion-card>
            }
          }
        </div>

        <div style="height: 24px"></div>
      }
    </ion-content>
  `,
  styles: [`
    .center { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 60vh; color: var(--ion-color-medium); }
    .center .emoji { font-size: 48px; margin-bottom: 12px; }
    .head { text-align: center; padding: 16px 20px 0; }
    .photo { width: 140px; height: 180px; border-radius: 14px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-photo { display: inline-flex; align-items: center; justify-content: center; font-size: 52px; }
    .head h1 { font-size: 24px; font-weight: 800; margin: 14px 0 0; }
    .meta { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 8px; color: var(--ion-color-medium); font-size: 13px; }
    .place { color: var(--ion-color-medium); font-size: 13px; margin: 6px 0 0; }
    .section { padding: 16px 12px 0; }
    .section .app-section-title { padding: 0 8px; }
    .section app-expandable-text { display: block; padding: 0 8px; }
    .item { margin: 0 0 10px; border-radius: 14px; }
    .row { display: flex; gap: 12px; padding: 12px; align-items: center; }
    .poster { width: 56px; height: 84px; flex: 0 0 auto; border-radius: 8px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-poster { display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .info { flex: 1; min-width: 0; }
    .info h2 { font-size: 15px; font-weight: 700; margin: 0; }
    .cmeta { display: flex; gap: 8px; align-items: center; margin-top: 4px; color: var(--ion-color-medium); font-size: 12px; }
    .badge { font-size: 10px; font-weight: 700; background: var(--ion-color-step-150, #374151); border-radius: 6px; padding: 2px 6px; }
    .char { font-size: 12px; color: var(--ion-color-medium); font-style: italic; margin: 4px 0 0; }
    .lib { font-size: 12px; font-weight: 700; color: var(--ion-color-secondary); margin: 6px 0 0; display: flex; align-items: center; gap: 4px; }
    .imp { font-size: 12px; font-weight: 700; color: var(--ion-color-primary); margin: 6px 0 0; }
  `],
})
export class PersonPage {
  private api = inject(ApiService);
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastController);

  person = signal<Person | undefined>(undefined);
  loading = signal(true);
  error = signal('');
  importingId = signal<number | null>(null);

  nameParam = '';
  private loadedKey = '';

  ionViewWillEnter(): void {
    const qp = this.route.snapshot.queryParamMap;
    const id = qp.get('id') || '';
    this.nameParam = qp.get('name') || '';
    const key = `${id}|${this.nameParam}`;
    // Evita recargar al volver de una película si es el mismo actor.
    if (key !== this.loadedKey) {
      this.loadedKey = key;
      this.load(id ? Number(id) : undefined, this.nameParam || undefined);
    } else {
      this.refreshLibraryFlags();
    }
  }

  async load(id?: number, name?: string): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.person.set(undefined);
    try {
      const { person } = await firstValueFrom(this.api.getPerson({ id, name }));
      this.person.set(person);
    } catch (e) {
      this.error.set(httpErrorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  // Al volver de importar un título, márcalo como "en tu catálogo" sin repedir a TMDB.
  private refreshLibraryFlags(): void {
    const p = this.person();
    if (!p) return;
    const local = new Map(this.data.movies().map((m) => [`${m.tmdbId}-${m.mediaType}`, m.id]));
    const credits = p.credits.map((c) => {
      const localId = local.get(`${c.tmdbId}-${c.mediaType}`);
      return localId ? { ...c, inLibrary: true, localId } : c;
    });
    this.person.set({ ...p, credits });
  }

  async open(c: PersonCredit): Promise<void> {
    if (c.inLibrary && c.localId) {
      this.router.navigate(['/movies', c.localId]);
      return;
    }
    if (this.importingId() !== null) return;
    this.importingId.set(c.tmdbId);
    try {
      const movie = await this.data.importMovie(c.tmdbId, c.mediaType);
      this.router.navigate(['/movies', movie.id]);
    } catch (e) {
      const t = await this.toast.create({ message: httpErrorMessage(e), duration: 2500, color: 'danger', position: 'top' });
      await t.present();
    } finally {
      this.importingId.set(null);
    }
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
