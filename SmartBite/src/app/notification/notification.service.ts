import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  icon: 'clock' | 'warning' | 'info' | 'check' | 'bell';
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: Date;
  isRead: boolean;
  orderId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  notifications$ = this.notifications.asObservable();
  unreadCount$ = this.unreadCount.asObservable();

  constructor() {
    // Load notifications from localStorage if available
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications).map((notif: any) => ({
        ...notif,
        timestamp: new Date(notif.timestamp)
      }));
      this.notifications.next(parsedNotifications);
      this.updateUnreadCount();
    } else {
      // Initialize with default notifications
      this.initializeDefaultNotifications();
    }
  }

  private initializeDefaultNotifications(): void {
    const defaultNotifications: Notification[] = [
      {
        id: this.generateId(),
        icon: 'clock',
        message: 'Best time to visit is 3-4pm.',
        type: 'info',
        timestamp: new Date(),
        isRead: false
      },
      {
        id: this.generateId(),
        icon: 'warning',
        message: 'High crowd expected at around 1pm.',
        type: 'warning',
        timestamp: new Date(),
        isRead: false
      },
      {
        id: this.generateId(),
        icon: 'info',
        message: 'Vendor A is currently unavailable',
        type: 'info',
        timestamp: new Date(),
        isRead: false
      }
    ];
    
    this.notifications.next(defaultNotifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      isRead: false
    };

    const currentNotifications = this.notifications.value;
    const updatedNotifications = [newNotification, ...currentNotifications];
    
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  markAsRead(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    );
    
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notif => ({ ...notif, isRead: true }));
    
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  deleteNotification(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(notif => notif.id !== notificationId);
    
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveToStorage();
  }

  clearAllNotifications(): void {
    this.notifications.next([]);
    this.unreadCount.next(0);
    localStorage.removeItem('notifications');
  }

  // Order-related notification methods
  addOrderConfirmedNotification(orderId: string, vendor: string): void {
    this.addNotification({
      icon: 'check',
      message: `Your order #${orderId} has been confirmed by ${vendor}!`,
      type: 'success',
      orderId: orderId
    });
  }

  addOrderReadyNotification(orderId: string, vendor: string): void {
    this.addNotification({
      icon: 'bell',
      message: `Your order #${orderId} from ${vendor} is ready for collection!`,
      type: 'success',
      orderId: orderId
    });
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.value.filter(notif => !notif.isRead).length;
    this.unreadCount.next(unreadCount);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private saveToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications.value));
  }
}