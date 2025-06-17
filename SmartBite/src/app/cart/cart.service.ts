import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isVeg: boolean;
  vendor: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  vendor: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  orderTime: Date;
  estimatedTime: number; // in minutes
  queuePosition: number;
  canCancel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private currentOrder = new BehaviorSubject<Order | null>(null);
  private cancelTimer: Subscription | null = null;

  cartItems$ = this.cartItems.asObservable();
  currentOrder$ = this.currentOrder.asObservable();

  constructor() {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      this.cartItems.next(JSON.parse(savedCart));
    }

    // Load current order from localStorage if available
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      const order = JSON.parse(savedOrder);
      order.orderTime = new Date(order.orderTime);
      this.currentOrder.next(order);
      this.startCancelTimer(order);
    }
  }

  addToCart(item: Omit<CartItem, 'quantity'>): void {
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex > -1) {
      // Item exists, increment quantity
      currentItems[existingItemIndex].quantity += 1;
    } else {
      // New item, add to cart
      currentItems.push({ ...item, quantity: 1 });
    }

    this.cartItems.next([...currentItems]);
    this.saveCartToStorage();
  }

  removeFromCart(itemId: string): void {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      if (currentItems[itemIndex].quantity > 1) {
        currentItems[itemIndex].quantity -= 1;
      } else {
        currentItems.splice(itemIndex, 1);
      }
    }

    this.cartItems.next([...currentItems]);
    this.saveCartToStorage();
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      currentItems[itemIndex].quantity = quantity;
      this.cartItems.next([...currentItems]);
      this.saveCartToStorage();
    }
  }

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem('cartItems');
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.cartItems.value.reduce((count, item) => count + item.quantity, 0);
  }

  createOrder(): void {
    const items = this.cartItems.value;
    if (items.length === 0) return;

    const order: Order = {
      id: this.generateOrderId(),
      items: [...items],
      totalAmount: this.getCartTotal(),
      vendor: items[0].vendor, // Assuming all items from same vendor
      status: 'in_progress',
      orderTime: new Date(),
      estimatedTime: 12, // Default 12 minutes
      queuePosition: 3, // Default queue position
      canCancel: true
    };

    this.currentOrder.next(order);
    this.clearCart();
    this.saveOrderToStorage(order);
    this.startCancelTimer(order);
  }

  cancelOrder(): void {
    const order = this.currentOrder.value;
    if (order && order.canCancel) {
      this.currentOrder.next(null);
      localStorage.removeItem('currentOrder');
      if (this.cancelTimer) {
        this.cancelTimer.unsubscribe();
        this.cancelTimer = null;
      }
    }
  }

  private startCancelTimer(order: Order): void {
    if (this.cancelTimer) {
      this.cancelTimer.unsubscribe();
    }

    // 2 minute cancellation window
    this.cancelTimer = timer(1 * 60 * 1000).subscribe(() => {
      const currentOrder = this.currentOrder.value;
      if (currentOrder && currentOrder.id === order.id) {
        currentOrder.canCancel = false;
        this.currentOrder.next({ ...currentOrder });
        this.saveOrderToStorage(currentOrder);
      }
    });
  }

  private generateOrderId(): string {
    const date = new Date();
    const year = date.getFullYear();
    const orderNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CFZ${year}-${orderNumber}`;
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems.value));
  }

  private saveOrderToStorage(order: Order): void {
    localStorage.setItem('currentOrder', JSON.stringify(order));
  }
}