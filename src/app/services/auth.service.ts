import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';
import { httpErrorMessage } from '../utils/error';

const TOKEN_KEY = 'rotten_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly ready = signal(false);

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string | null): void {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Carga el usuario al arrancar la app (si hay token).
  async init(): Promise<void> {
    if (!this.token) {
      this.ready.set(true);
      return;
    }
    try {
      const { user } = await firstValueFrom(this.api.getMe());
      this.user.set(user);
    } catch {
      this.setToken(null);
      this.user.set(null);
    } finally {
      this.ready.set(true);
    }
  }

  async register(name: string, email: string, password: string, isCritic: boolean): Promise<{ error?: string }> {
    try {
      const { user, token } = await firstValueFrom(this.api.register(name, email, password, isCritic));
      this.setToken(token);
      this.user.set(user);
      return {};
    } catch (e) {
      return { error: httpErrorMessage(e) };
    }
  }

  async login(email: string, password: string): Promise<{ error?: string }> {
    try {
      const { user, token } = await firstValueFrom(this.api.login(email, password));
      this.setToken(token);
      this.user.set(user);
      return {};
    } catch (e) {
      return { error: httpErrorMessage(e) };
    }
  }

  async logout(): Promise<void> {
    this.setToken(null);
    this.user.set(null);
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async updateProfile(
    updates: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'isCritic'>> & { password?: string; currentPassword?: string }
  ): Promise<{ error?: string }> {
    try {
      const { user } = await firstValueFrom(this.api.updateMe(updates));
      this.user.set(user);
      return {};
    } catch (e) {
      return { error: httpErrorMessage(e) };
    }
  }

  async deleteAccount(): Promise<{ error?: string }> {
    try {
      await firstValueFrom(this.api.deleteMe());
      this.setToken(null);
      this.user.set(null);
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return {};
    } catch (e) {
      return { error: httpErrorMessage(e) };
    }
  }
}
