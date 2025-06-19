// cart.component.ts
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { CartService, CartItem, Order } from './cart.service'; // Import necessary types
import { Subscription } from 'rxjs'; // For managing subscriptions
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  @Output() cartClosed = new EventEmitter<void>();
  isCartOpen: boolean = false;
  cartItems: CartItem[] = [];
  itemCount: number = 0;
  totalAmount: number = 0;
  currentOrders: Order[] | null = null; // To display current order status
  
  private cartSubscription: Subscription | null = null;
  private orderSubscription: Subscription | null = null;

  constructor(private cartService: CartService,
    private router :Router, private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    // Subscribe to cart item changes
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.itemCount = this.cartService.getItemCount();
      this.totalAmount = this.cartService.getCartTotal();
      console.log('CartComponent: Cart items updated. Count:', this.itemCount, 'Total:', this.totalAmount); // Debug log
    });

    // Subscribe to current order changes
    this.orderSubscription = this.cartService.currentOrders$.subscribe((orders: Order[]) => {
      this.currentOrders = orders;
      console.log('CartComponent: Current orders updated:', this.currentOrders); // Debug log
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    console.log('Cart toggled. isCartOpen:', this.isCartOpen); // Debug log
        if (!this.isCartOpen) {
      this.cartClosed.emit();
    }
  }

  // Methods to interact with CartService
  incrementQuantity(itemId: string): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      this.cartService.updateQuantity(itemId, item.quantity + 1);
    }
  }

  decrementQuantity(itemId: string): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      this.cartService.updateQuantity(itemId, item.quantity - 1);
    }
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  placeOrder(): void {
    this.cartService.createOrders();
    this.router.navigate(['/']).then(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });;
  }

  cancelOrder(): void {
    this.cartService.cancelOrder();
  }
}
