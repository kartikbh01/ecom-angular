import { Injectable, inject } from '@angular/core';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';
import { databases, ID } from '../../lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = '69f30dc90029157900dd';
const COLLECTION_ID = 'orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private authService = inject(AuthService);
  
  async fetchOrders(): Promise<Order[]> {
    const user = this.authService.currentUser();
    if (!user) return [];
    
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal('userId', user.$id),
        Query.orderDesc('$createdAt')
      ]);

      return response.documents.map((doc: any) => ({
        id: doc.$id,
        userId: doc.userId,
        items: JSON.parse(doc.items),
        totalAmount: doc.totalPrice || doc.totalAmount, // handles potential typo from previous design
        date: doc.$createdAt,
        status: doc.status
      })) as Order[];
    } catch (e) {
      console.error('Failed to fetch orders', e);
      return [];
    }
  }

  async createOrder(order: Omit<Order, 'userId' | 'id' | 'date'>): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;
    
    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        items: JSON.stringify(order.items),
        totalPrice: order.totalAmount, // Our schema had totalPrice
        status: order.status
      });
    } catch (e) {
      console.error('Failed to create order', e);
      throw e;
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, orderId);
    } catch (e) {
      console.error('Failed to cancel order', e);
      throw e;
    }
  }
}
