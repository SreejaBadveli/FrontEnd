// homepage.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, Order, CartItem } from '../cart/cart.service'; // Import CartService and Order/CartItem interfaces
import { Subscription } from 'rxjs'; // Import Subscription for managing observables
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {
  currentOrders: Order[] = [];
  private ordersSubscription: Subscription | null = null; 
  countdown: number = 60;
  showCancelButton: boolean = false;
  constructor(
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService 
  ) { }

  ngOnInit(): void {
    // Subscribe to current order changes from CartService
    this.ordersSubscription = this.cartService.currentOrders$.subscribe(orders => {
      this.currentOrders = orders;
      console.log('HomepageComponent: Current orders received:', this.currentOrders); // Debug log
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks when the component is destroyed
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  // Helper function to format order items for display (e.g., "Pizza + Coffee")
  getOrderedItemsSummary(items: CartItem[]): string {
    if (!items || items.length === 0) return '';
    return items.map(item => `${item.name} x${item.quantity}`).join(' + ');
  }

cancelOrder(orderId: string, vendor: string): void {

  this.notificationService.addOrderCancelledNotification(orderId, vendor);
  const updatedOrders = this.currentOrders.filter(order => order.id !== orderId);

  this.currentOrders = updatedOrders;

  this.cartService.currentOrders.next(updatedOrders);

  this.cartService.saveOrdersToStorage(updatedOrders);
}
}
