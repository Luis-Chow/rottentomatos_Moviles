import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton, IonIcon,
  IonInput, IonItem, IonLabel, IonToggle,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton, IonIcon,
    IonInput, IonItem, IonLabel, IonToggle,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>👤 Perfil</ion-title></ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (auth.user(); as user) {
        <input #fileInput type="file" accept="image/*" (change)="onFile($event)" hidden />

        <div class="head">
          <ion-avatar class="avatar" (click)="fileInput.click()">
            @if (user.avatar) { <img [src]="user.avatar" alt="avatar" /> }
            @else { <div class="letter">{{ user.name.charAt(0).toUpperCase() }}</div> }
          </ion-avatar>
          <p class="hint" (click)="fileInput.click()">📷 {{ user.avatar ? 'Cambiar' : 'Añadir foto' }}</p>
          @if (user.avatar) { <p class="remove" (click)="removeAvatar()">Quitar foto</p> }
          <h1>{{ user.name }}</h1>
          <p class="email">{{ user.email }}</p>
          <span class="role" [class.critic]="user.isCritic">{{ user.isCritic ? '🎬 Crítico' : '👤 Usuario' }}</span>
        </div>

        <div class="card">
          @if (editing()) {
            <ion-input label="Nombre" labelPlacement="stacked" fill="outline" [(ngModel)]="name"></ion-input>
            <ion-input class="ion-margin-top" label="Correo" labelPlacement="stacked" fill="outline" type="email" [(ngModel)]="email"></ion-input>
            <ion-item lines="none" class="toggle">
              <ion-label>
                <h3>Soy crítico 🎬</h3>
                <p class="small">Tus puntajes cuentan en el promedio de "Críticos".</p>
              </ion-label>
              <ion-toggle slot="end" [(ngModel)]="isCritic"></ion-toggle>
            </ion-item>
            <ion-input class="ion-margin-top" label="Nueva contraseña (opcional)" labelPlacement="stacked" fill="outline"
              type="password" placeholder="Dejar vacío para no cambiar" [(ngModel)]="password"></ion-input>
            @if (password) {
              <ion-input class="ion-margin-top" label="Contraseña actual" labelPlacement="stacked" fill="outline"
                type="password" placeholder="Ingresa tu contraseña actual" [(ngModel)]="currentPassword"></ion-input>
            }
            <div class="row">
              <ion-button expand="block" fill="outline" color="medium" (click)="cancel()">Cancelar</ion-button>
              <ion-button expand="block" (click)="save()" [disabled]="loading()">Guardar</ion-button>
            </div>
          } @else {
            <ion-button expand="block" (click)="startEdit()">
              <ion-icon slot="start" name="create-outline"></ion-icon>Editar perfil
            </ion-button>
          }
        </div>

        <div class="card">
          <ion-button expand="block" color="medium" (click)="logout()">
            <ion-icon slot="start" name="log-out-outline"></ion-icon>Cerrar sesión
          </ion-button>
          <ion-button expand="block" color="danger" class="ion-margin-top" (click)="confirmDelete()">
            <ion-icon slot="start" name="trash-outline"></ion-icon>Eliminar cuenta
          </ion-button>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .head { text-align: center; margin-bottom: 24px; }
    .avatar { width: 96px; height: 96px; margin: 0 auto; cursor: pointer; }
    .avatar .letter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ion-color-primary); color: #fff; font-size: 36px; font-weight: 800; border-radius: 50%; }
    .hint { color: var(--ion-color-medium); font-size: 12px; margin: 6px 0 0; cursor: pointer; }
    .remove { color: var(--ion-color-danger); font-size: 12px; font-weight: 600; margin: 4px 0 0; cursor: pointer; }
    h1 { font-size: 22px; font-weight: 800; margin: 8px 0 0; }
    .email { color: var(--ion-color-medium); font-size: 14px; margin: 4px 0 0; }
    .role { display: inline-block; font-size: 12px; font-weight: 800; color: var(--ion-color-secondary); background: var(--ion-color-step-100, #1f2937); border-radius: 10px; padding: 5px 12px; margin-top: 10px; }
    .role.critic { color: #f5c518; }
    .card { background: var(--ion-color-step-100, #1f2937); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
    .toggle { --background: transparent; margin-top: 8px; }
    .toggle h3 { font-size: 14px; font-weight: 700; }
    .small { font-size: 12px; color: var(--ion-color-medium); white-space: normal; }
    .row { display: flex; gap: 12px; margin-top: 16px; }
    .row ion-button { flex: 1; }
  `],
})
export class ProfilePage {
  auth = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastController);

  editing = signal(false);
  loading = signal(false);

  name = '';
  email = '';
  isCritic = false;
  password = '';
  currentPassword = '';

  startEdit(): void {
    const u = this.auth.user();
    this.name = u?.name || '';
    this.email = u?.email || '';
    this.isCritic = u?.isCritic ?? false;
    this.password = '';
    this.currentPassword = '';
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
  }

  private async toastMsg(message: string, color = 'danger'): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }

  async save(): Promise<void> {
    if (!this.name.trim()) { await this.toastMsg('El nombre es requerido.'); return; }
    if (!/\S+@\S+\.\S+/.test(this.email.trim())) { await this.toastMsg('Correo inválido.'); return; }
    if (this.password) {
      if (/\s/.test(this.password) || this.password.length < 6) { await this.toastMsg('La contraseña debe tener al menos 6 caracteres y sin espacios.'); return; }
      if (!this.currentPassword) { await this.toastMsg('Ingresa tu contraseña actual.'); return; }
    }
    this.loading.set(true);
    const updates: Parameters<AuthService['updateProfile']>[0] = {
      name: this.name.trim(),
      email: this.email.trim(),
      isCritic: this.isCritic,
    };
    if (this.password) {
      updates.password = this.password;
      updates.currentPassword = this.currentPassword;
    }
    const result = await this.auth.updateProfile(updates);
    this.loading.set(false);
    if (result.error) { await this.toastMsg(result.error); return; }
    this.editing.set(false);
    await this.toastMsg('Perfil actualizado.', 'success');
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.toastMsg('La imagen es muy grande (máx 2MB).');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;
      const result = await this.auth.updateProfile({ avatar: dataUri });
      if (result.error) await this.toastMsg(result.error);
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  async removeAvatar(): Promise<void> {
    const result = await this.auth.updateProfile({ avatar: '' });
    if (result.error) await this.toastMsg(result.error);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cuenta',
      message: '¿Estás seguro? Esta acción no se puede deshacer y perderás todas tus reseñas.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive', handler: async () => {
            const result = await this.auth.deleteAccount();
            if (result.error) await this.toastMsg(result.error);
          },
        },
      ],
    });
    await alert.present();
  }
}
