import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isModalOpen = signal(false);
  modalMode = signal<'signin' | 'signup'>('signin');
  isLoggedIn = signal(false);
  currentUser = signal<{ name: string; email: string } | null>(null);

  openModal(mode: 'signin' | 'signup' = 'signin'): void {
    this.modalMode.set(mode);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  logout(): void {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}
