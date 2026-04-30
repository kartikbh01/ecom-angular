import { Injectable, inject } from '@angular/core';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private authService = inject(AuthService);
  
  getOrders(): Order[] {
    const user = this.authService.currentUser();
    if (!user) return [];
    
    const allOrdersStr = localStorage.getItem('shoplux_orders');
    const allOrders: Order[] = allOrdersStr ? JSON.parse(allOrdersStr) : [];
    return allOrders
      .filter(o => o.userId === user.email)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addOrder(order: Omit<Order, 'userId'>): void {
    const user = this.authService.currentUser();
    if (!user) return;
    
    const newOrder: Order = {
      ...order,
      userId: user.email
    };
    
    const allOrdersStr = localStorage.getItem('shoplux_orders');
    const allOrders: Order[] = allOrdersStr ? JSON.parse(allOrdersStr) : [];
    allOrders.push(newOrder);
    localStorage.setItem('shoplux_orders', JSON.stringify(allOrders));
  }

  deleteOrder(orderId: string): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const allOrdersStr = localStorage.getItem('shoplux_orders');
    if (allOrdersStr) {
      let allOrders: Order[] = JSON.parse(allOrdersStr);
      allOrders = allOrders.filter(o => o.id !== orderId);
      localStorage.setItem('shoplux_orders', JSON.stringify(allOrders));
    }
  }
}
