import { Injectable, signal } from '@angular/core';
import { account, ID } from '../../lib/appwrite';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isModalOpen = signal(false);
  modalMode = signal<'signin' | 'signup'>('signin');
  isLoggedIn = signal(false);
  currentUser = signal<{ name: string; email: string } | null>(null);

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
    await account.createEmailPasswordSession(email, password);
    await this.checkSession();
    this.closeModal();
  }

  async signup(email: string, password: string, name: string): Promise<void> {
    await account.create(ID.unique(), email, password, name);
    await this.login(email, password);
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch (e) {
      console.error('Logout error', e);
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}
