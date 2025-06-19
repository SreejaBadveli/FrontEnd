import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './home-page/home-page.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuComponent } from './menu/menu.component';
import { NotificationComponent } from './notification/notification.component';
import { CartComponent } from './cart/cart.component';

const routes: Routes = [
   { path: '', component: HomepageComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'menu/:vendor', component: MenuComponent },
  { path: 'notifications', component: NotificationComponent },
  { path: 'cart', component: CartComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
