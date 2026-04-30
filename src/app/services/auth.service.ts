import { Injectable, signal, inject } from '@angular/core';
import { account, ID } from '../../lib/appwrite';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isModalOpen = signal(false);
  modalMode = signal<'signin' | 'signup'>('signin');
  isLoggedIn = signal(false);
  currentUser = signal<{ name: string; email: string } | null>(null);
  private toastService = inject(ToastService);

  constructor() {
    this.checkSession();
  }

  async checkSession() {
    try {
      const user = await account.get();
      this.isLoggedIn.set(true);
      this.currentUser.set({ name: user.name, email: user.email });
    } catch (e) {
      this.isLoggedIn.set(false);
      this.currentUser.set(null);
    }
  }

  openModal(mode: 'signin' | 'signup' = 'signin'): void {
    this.modalMode.set(mode);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await account.createEmailPasswordSession(email, password);
      await this.checkSession();
      this.closeModal();
      this.toastService.success(`Welcome back, ${this.currentUser()?.name || 'User'}!`);
    } catch (e: any) {
      this.toastService.error(e.message || 'Login failed. Please try again.');
      throw e;
    }
  }

  async signup(email: string, password: string, name: string): Promise<void> {
    try {
      await account.create(ID.unique(), email, password, name);
      await this.login(email, password);
    } catch (e: any) {
      this.toastService.error(e.message || 'Signup failed. Please try again.');
      throw e;
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.toastService.info('You have been logged out.');
    } catch (e) {
      console.error('Logout error', e);
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}
