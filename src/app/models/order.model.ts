import { CartItem } from './product.model';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered';
}
