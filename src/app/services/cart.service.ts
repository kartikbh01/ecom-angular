import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, Product } from '../models/product.model';
import { ToastService } from './toast.service';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { databases, ID } from '../../lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = '69f30dc90029157900dd';
const COLLECTION_ID = 'cart_items';

@Injectable({ providedIn: 'root' })
export class CartService {
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private items = signal<CartItem[]>([]);
  isOpen = signal(false);
  
  private cartDocId: string | null = null;

  cartItems = this.items.asReadonly();

  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  totalPrice = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadCart();
      } else {
        this.items.set([]);
        this.cartDocId = null;
      }
    });
  }

  private async loadCart() {
    try {
      const user = this.authService.currentUser();
      if (!user) return;

      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal('userId', user.$id)
      ]);
      
      if (response.documents.length > 0) {
        const doc = response.documents[0];
        this.cartDocId = doc.$id;
        const parsedItems = doc['items'] ? JSON.parse(doc['items']) : [];
        this.items.set(parsedItems);
      } else {
        this.cartDocId = null;
        this.items.set([]);
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  }

  private async syncCart() {
    const user = this.authService.currentUser();
    if (!user) return; // Do not sync if not logged in

    try {
      const itemsStr = JSON.stringify(this.items());
      if (this.cartDocId) {
        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, this.cartDocId, {
          items: itemsStr
        });
      } else {
        const response = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
          userId: user.$id,
          items: itemsStr
        });
        this.cartDocId = response.$id;
      }
    } catch (e) {
      console.error('Failed to sync cart', e);
      this.toastService.error('Failed to save cart to cloud');
    }
  }

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
    this.syncCart();
  }

  removeFromCart(productId: number): void {
    this.items.update(items => items.filter(i => i.product.id !== productId));
    this.syncCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
    this.syncCart();
  }

  clearCart(): void {
    this.items.set([]);
    this.syncCart();
  }

  openCart(): void {
    this.isOpen.set(true);
  }

  closeCart(): void {
    this.isOpen.set(false);
  }
}
