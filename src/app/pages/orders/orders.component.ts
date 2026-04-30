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

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.authService.openModal('signin');
      this.router.navigate(['/']);
      return;
    }
    
    this.orders.set(this.orderService.getOrders());
  }

  cancelOrder(orderId: string): void {
    this.orderService.deleteOrder(orderId);
    this.orders.set(this.orderService.getOrders());
    this.toastService.success(`Order #${orderId} has been cancelled.`);
  }
}
