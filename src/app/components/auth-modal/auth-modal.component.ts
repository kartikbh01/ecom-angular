import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
})
export class AuthModalComponent {
  authService = inject(AuthService);
  showPassword = signal(false);
  isLoading = signal(false);

  email = '';
  password = '';
  firstName = '';
  lastName = '';

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    try {
      if (this.authService.modalMode() === 'signin') {
        await this.authService.login(this.email, this.password);
      } else {
        const name = `${this.firstName} ${this.lastName}`.trim() || 'User';
        await this.authService.signup(this.email, this.password, name);
      }
      this.email = '';
      this.password = '';
      this.firstName = '';
      this.lastName = '';
    } catch (e) {
      console.error(e);
      // Optional: add error handling UI
    } finally {
      this.isLoading.set(false);
    }
  }
}
