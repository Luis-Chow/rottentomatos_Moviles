import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonInput, IonButton, IonSpinner, IonText, IonToggle, IonItem, IonLabel,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonInput, IonButton, IonSpinner, IonText, IonToggle, IonItem, IonLabel],
  template: `
    <ion-content class="ion-padding">
      <div class="wrap">
        <div class="brand">🍅</div>
        <h1>Crear cuenta</h1>
        <p class="subtitle">Únete y reseña tus películas</p>

        <div class="card">
          <ion-input label="Nombre" labelPlacement="stacked" fill="outline" placeholder="Tu nombre" [(ngModel)]="name"></ion-input>
          <ion-input class="ion-margin-top" label="Correo electrónico" labelPlacement="stacked" fill="outline"
            type="email" autocomplete="email" placeholder="tu@correo.com" [(ngModel)]="email"></ion-input>
          <ion-input class="ion-margin-top" label="Contraseña" labelPlacement="stacked" fill="outline"
            type="password" placeholder="Mínimo 6 caracteres" [(ngModel)]="password"></ion-input>
          <ion-input class="ion-margin-top" label="Confirmar contraseña" labelPlacement="stacked" fill="outline"
            type="password" placeholder="Repite la contraseña" [(ngModel)]="confirm"></ion-input>

          <ion-item lines="none" class="critic">
            <ion-label>
              <h3>Soy crítico 🎬</h3>
              <p class="hint">Tus puntajes contarán en el promedio de "Críticos", aparte del de usuarios.</p>
            </ion-label>
            <ion-toggle slot="end" [(ngModel)]="isCritic"></ion-toggle>
          </ion-item>

          @if (error) {
            <ion-text color="danger"><p class="err">⚠️ {{ error }}</p></ion-text>
          }

          <ion-button expand="block" class="ion-margin-top" (click)="submit()" [disabled]="loading">
            @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { Crear cuenta }
          </ion-button>
        </div>

        <p class="foot">
          ¿Ya tienes cuenta?
          <a [routerLink]="['/login']">Inicia sesión</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .wrap { max-width: 480px; margin: 0 auto; min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 16px 0; }
    .brand { font-size: 56px; text-align: center; }
    h1 { text-align: center; font-weight: 800; margin: 4px 0 0; }
    .subtitle { text-align: center; color: var(--ion-color-medium); margin: 4px 0 24px; }
    .card { background: var(--ion-color-step-100, #1f2937); border-radius: 16px; padding: 20px; }
    .critic { --background: transparent; margin-top: 8px; }
    .critic h3 { font-size: 14px; font-weight: 700; }
    .hint { font-size: 12px; color: var(--ion-color-medium); white-space: normal; }
    .err { font-size: 13px; font-weight: 600; margin: 12px 0 0; }
    .foot { text-align: center; color: var(--ion-color-medium); margin-top: 20px; }
    .foot a { color: var(--ion-color-primary); font-weight: 700; text-decoration: none; }
  `],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastController);

  name = '';
  email = '';
  password = '';
  confirm = '';
  isCritic = false;
  error = '';
  loading = false;

  async submit(): Promise<void> {
    this.error = '';
    if (!this.name.trim()) { this.error = 'El nombre es requerido.'; return; }
    if (!/\S+@\S+\.\S+/.test(this.email)) { this.error = 'Correo inválido.'; return; }
    if (/\s/.test(this.password)) { this.error = 'La contraseña no puede contener espacios.'; return; }
    if (this.password.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    if (this.password !== this.confirm) { this.error = 'Las contraseñas no coinciden.'; return; }

    this.loading = true;
    const result = await this.auth.register(this.name.trim(), this.email.trim(), this.password, this.isCritic);
    this.loading = false;
    if (result.error) {
      this.error = result.error;
      const t = await this.toast.create({ message: result.error, duration: 2500, color: 'danger', position: 'top' });
      await t.present();
      return;
    }
    await this.router.navigateByUrl('/tabs/catalog', { replaceUrl: true });
  }
}
