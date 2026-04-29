import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = signal('');
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: query.trim() } });
    }
  }

  onSearchKeydown(event: KeyboardEvent, query: string): void {
    if (event.key === 'Enter') {
      this.onSearch(query);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }
}
