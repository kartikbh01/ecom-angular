import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

type CheckoutStep = 'address' | 'payment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);
  authService = inject(AuthService);
  orderService = inject(OrderService);
  private router = inject(Router);

  step = signal<CheckoutStep>('address');
  showSuccessModal = signal(false);
  countdown = signal(5);
  orderId = ('' + Date.now()).slice(-8);

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.authService.openModal('signin');
      this.router.navigate(['/']);
    }
  }

  address = {
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  };

  payment = {
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  };

  goToPayment(): void {
    this.step.set('payment');
    window.scrollTo(0, 0);
  }

  isPlacingOrder = signal(false);

  async placeOrder(): Promise<void> {
    const items = this.cartService.cartItems();
    const total = this.cartService.totalPrice();

    this.isPlacingOrder.set(true);
    
    try {
      await this.orderService.createOrder({
        items: items,
        totalAmount: total,
        status: 'Processing'
      });

      this.showSuccessModal.set(true);
      this.cartService.clearCart();

      this.countdownInterval = setInterval(() => {
        this.countdown.update(v => v - 1);
        if (this.countdown() <= 0) {
          this.clearCountdown();
          this.router.navigate(['/']);
        }
      }, 1000);
    } catch (e) {
      console.error('Failed to place order', e);
    } finally {
      this.isPlacingOrder.set(false);
    }
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  formatCardNumber(value: string): string {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.formatCardNumber(input.value);
    this.payment.cardNumber = input.value;
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    input.value = v;
    this.payment.expiry = v;
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }
}
