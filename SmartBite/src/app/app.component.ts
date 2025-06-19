// Add these properties and methods to your app.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { NotificationService, Notification } from './notification/notification.service';

@Component({
  selector: 'app-root', 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  showPopupNotification = false;
  popupNotification: {
    type: 'success' | 'info' | 'warning' | 'error';
    icon: 'check' | 'bell' | 'info' | 'warning' | 'clock';
    title: string;
    message: string;
  } | null = null;

  private subscription: Subscription = new Subscription();
  private lastNotificationId: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Listen for new notifications to show as popups
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        if (notifications.length > 0) {
          const latestNotification = notifications[0];
          
          // Only show popup for new notifications (not on page load)
          if (this.lastNotificationId && latestNotification.id !== this.lastNotificationId) {
            this.showOrderPopupNotification(latestNotification);
          }
          
          this.lastNotificationId = latestNotification.id;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private showOrderPopupNotification(notification: Notification): void {
    // Only show popup for order-related notifications
    if (notification.orderId) {
      this.popupNotification = {
        type: notification.type,
        icon: notification.icon,
        title: this.getPopupTitle(notification),
        message: notification.message
      };
      this.showPopupNotification = true;
    }
  }

  private getPopupTitle(notification: Notification): string {
    if (notification.message.includes('confirmed')) {
      return 'Order Confirmed!';
    } else if (notification.message.includes('ready')) {
      return 'Order Ready!';
    }
    return 'Notification';
  }

  onPopupClosed(): void {
    this.showPopupNotification = false;
    this.popupNotification = null;
  }
}
