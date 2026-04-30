import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models/product.model';
import { ToastService } from './toast.service';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private toastService = inject(ToastService);
  private items = signal<CartItem[]>([]);
  isOpen = signal(false);

  cartItems = this.items.asReadonly();

  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  totalPrice = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  addToCart(product: Product): void {
    const current = this.items();
    const idx = current.findIndex(i => i.product.id === product.id);
    if (idx >= 0) {
      this.items.update(items =>
        items.map((item, i) => i === idx ? { ...item, quantity: item.quantity + 1 } : item)
      );
    } else {
      this.items.update(items => [...items, { product, quantity: 1 }]);
    }
    this.toastService.success(`${product.title} added to cart!`);
  }

  removeFromCart(productId: number): void {
    this.items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  clearCart(): void {
    this.items.set([]);
  }

  openCart(): void {
    this.isOpen.set(true);
  }

  closeCart(): void {
    this.isOpen.set(false);
  }
}
