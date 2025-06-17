// homepage.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, Order, CartItem } from '../cart/cart.service'; // Import CartService and Order/CartItem interfaces
import { Subscription } from 'rxjs'; // Import Subscription for managing observables

@Component({
  selector: 'app-homepage',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {

  currentOrder: Order | null = null; // Property to hold the current order details
  private orderSubscription: Subscription | null = null; // To manage the subscription

  constructor(
    private router: Router,
    private cartService: CartService // Inject CartService
  ) { }

  ngOnInit(): void {
    // Subscribe to current order changes from CartService
    this.orderSubscription = this.cartService.currentOrder$.subscribe(order => {
      this.currentOrder = order;
      console.log('HomepageComponent: Current order received:', this.currentOrder); // Debug log
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks when the component is destroyed
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
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

  // Method to handle canceling the order
  cancelOrder(): void {
    this.cartService.cancelOrder();
    console.log('HomepageComponent: Cancel order initiated.');
  }
}
