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

  async updateQuantity(order: Order, itemIndex: number, change: number): Promise<void> {
    const newItems = [...order.items];
    const item = newItems[itemIndex];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeItem(order, itemIndex);
      return;
    }

    newItems[itemIndex] = { ...item, quantity: newQuantity };
    const newTotalAmount = newItems.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
    
    try {
      await this.orderService.updateOrder(order.id, newItems, newTotalAmount);
      const updatedOrders = this.orders().map(o => o.id === order.id ? { ...o, items: newItems, totalAmount: newTotalAmount } : o);
      this.orders.set(updatedOrders);
      this.toastService.success('Order quantity updated.');
    } catch (e) {
      this.toastService.error('Failed to update order.');
    }
  }

  async removeItem(order: Order, itemIndex: number): Promise<void> {
    if (!confirm('Are you sure you want to remove this item from your order?')) return;

    const newItems = [...order.items];
    newItems.splice(itemIndex, 1);

    if (newItems.length === 0) {
      await this.cancelOrder(order.id);
      return;
    }

    const newTotalAmount = newItems.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

    try {
      await this.orderService.updateOrder(order.id, newItems, newTotalAmount);
      const updatedOrders = this.orders().map(o => o.id === order.id ? { ...o, items: newItems, totalAmount: newTotalAmount } : o);
      this.orders.set(updatedOrders);
      this.toastService.success('Item removed from order.');
    } catch (e) {
      this.toastService.error('Failed to update order.');
    }
  }
}
