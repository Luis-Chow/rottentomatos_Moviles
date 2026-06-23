import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonInput, IonButton, IonSpinner, IonText, ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonContent, IonInput, IonButton, IonSpinner, IonText],
  template: `
    <ion-content class="ion-padding">
      <div class="wrap">
        <div class="brand">🍅</div>
        <h1>RottenTomatos</h1>
        <p class="subtitle">Inicia sesión para continuar</p>

        <div class="card">
          <ion-input
            label="Correo electrónico" labelPlacement="stacked" fill="outline"
            type="email" autocomplete="email" placeholder="tu@correo.com"
            [(ngModel)]="email" (keyup.enter)="submit()"
          ></ion-input>

          <ion-input
            class="ion-margin-top"
            label="Contraseña" labelPlacement="stacked" fill="outline"
            type="password" placeholder="••••••••"
            [(ngModel)]="password" (keyup.enter)="submit()"
          ></ion-input>

          @if (error) {
            <ion-text color="danger"><p class="err">⚠️ {{ error }}</p></ion-text>
          }

          <ion-button expand="block" class="ion-margin-top" (click)="submit()" [disabled]="loading">
            @if (loading) { <ion-spinner name="crescent"></ion-spinner> } @else { Iniciar sesión }
          </ion-button>
        </div>

        <p class="foot">
          ¿No tienes cuenta?
          <a [routerLink]="['/register']">Regístrate</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .wrap { max-width: 480px; margin: 0 auto; min-height: 100%; display: flex; flex-direction: column; justify-content: center; }
    .brand { font-size: 56px; text-align: center; }
    h1 { text-align: center; font-weight: 800; margin: 4px 0 0; }
    .subtitle { text-align: center; color: var(--ion-color-medium); margin: 4px 0 24px; }
    .card { background: var(--ion-color-step-100, #1f2937); border-radius: 16px; padding: 20px; }
    .err { font-size: 13px; font-weight: 600; margin: 12px 0 0; }
    .foot { text-align: center; color: var(--ion-color-medium); margin-top: 20px; }
    .foot a { color: var(--ion-color-primary); font-weight: 700; text-decoration: none; }
  `],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastController);

  email = '';
  password = '';
  error = '';
  loading = false;

  async submit(): Promise<void> {
    this.error = '';
    if (!this.email.trim() || !/\S+@\S+\.\S+/.test(this.email)) {
      this.error = 'Ingresa un correo válido.';
      return;
    }
    if (!this.password) {
      this.error = 'La contraseña es requerida.';
      return;
    }
    this.loading = true;
    const result = await this.auth.login(this.email.trim(), this.password);
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
