import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
   { path: '', component: HomePageComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'menu', component: MenuComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
