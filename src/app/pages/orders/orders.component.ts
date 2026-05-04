import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  private router = inject(Router);
  
  orders = signal<Order[]>([]);
  isLoading = signal(true);

  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.authService.openModal('signin');
      this.router.navigate(['/']);
      return;
    }
    
    try {
      const fetchedOrders = await this.orderService.fetchOrders();
      this.orders.set(fetchedOrders);
    } catch (e) {
      this.toastService.error('Failed to load orders.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.orderService.cancelOrder(orderId);
      const fetchedOrders = await this.orderService.fetchOrders();
      this.orders.set(fetchedOrders);
      this.toastService.success(`Order has been cancelled.`);
    } catch (e) {
      this.toastService.error('Failed to cancel order.');
    }
  }
}
