import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartComponent } from '../cart/cart.component';
import { Subscription } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  unreadNotificationCount = 0;
   isCartOpen: boolean = false;
   itemCount: number = 0;
   private subscription: Subscription = new Subscription();
  private cartSubscription: Subscription | null = null;
  @ViewChild(CartComponent) cartComponent!: CartComponent;
  constructor(private router :Router,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.itemCount = this.cartService.getItemCount();
    });

    this.subscription.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadNotificationCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    this.subscription.unsubscribe();
  }
   navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }
  goToNotifications() {
    this.router.navigate(['/notifications']);
  }
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  toggleCart(): void {
    this.isCartOpen = true;
    
    setTimeout(() => {
      if (this.cartComponent) {
        this.cartComponent.isCartOpen = true;
      }
    }, 0);
  }
    onCartClosed(): void {
    this.isCartOpen = false;
  }
}
