import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-popup-notification',
  template: `
    <div *ngIf="show" class="popup-overlay" [@fadeInOut]>
      <div class="popup-container" [@slideInOut]>
        <div class="popup-content" [ngClass]="'popup-' + type">
          <div class="popup-icon">
            <svg *ngIf="icon === 'check'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg *ngIf="icon === 'bell'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <svg *ngIf="icon === 'info'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 17v-6m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="popup-message">
            <h3 class="popup-title">{{ title }}</h3>
            <p class="popup-text">{{ message }}</p>
          </div>
          <button class="popup-close" (click)="onClose()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="close-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      z-index: 1000;
      padding-top: 20px;
    }

    .popup-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      width: 90%;
      margin: 20px;
    animation: dropDown 0.3s ease-out;

    }

    .popup-content {
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
    }

    .popup-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popup-success .popup-icon {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .popup-info .popup-icon {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .popup-warning .popup-icon {
      background-color: #fef3c7;
      color: #d97706;
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .popup-message {
      flex: 1;
      min-width: 0;
    }

    .popup-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .popup-text {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
    }

    .popup-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 6px;
      color: #9ca3af;
      transition: all 0.2s;
    }

    .popup-close:hover {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .close-icon {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 640px) {
      .popup-container {
        margin: 16px;
      }
      
      .popup-content {
        padding: 20px;
      }
      
      .popup-title {
        font-size: 16px;
      }
      
      .popup-text {
        font-size: 13px;
      }
    }
  `],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0)', opacity: 1 })),
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class PopupNotificationComponent implements OnInit {
  @Input() show: boolean = false;
  @Input() type: 'success' | 'info' | 'warning' | 'error' = 'info';
  @Input() icon: 'check' | 'bell' | 'info' | 'warning' | 'clock'= 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() autoClose: boolean = true;
  @Input() autoCloseDelay: number = 5000;
  
  @Output() closed = new EventEmitter<void>();

  ngOnInit() {
    if (this.autoClose && this.show) {
      setTimeout(() => {
        this.onClose();
      }, this.autoCloseDelay);
    }
  }

  onClose() {
    this.show = false;
    this.closed.emit();
  }
}