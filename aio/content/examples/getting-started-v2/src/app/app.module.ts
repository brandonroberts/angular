// #docplaster
// #docregion product-details-route
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
// #enddocregion product-details-route
import { CartComponent } from './cart/cart.component';
// #docregion product-details-route


@NgModule({
  imports: [
    BrowserModule,
    // #enddocregion product-details-route
    HttpClientModule,
    ReactiveFormsModule,
    // #docregion product-details-route
    RouterModule.forRoot([
      { path: '', component: ProductListComponent },
      { path: 'products/:productId', component: ProductDetailsComponent },
// #enddocregion product-details-route
      { path: 'cart', component: CartComponent }
// #docregion product-details-route
    ])
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    ProductDetailsComponent,
// #enddocregion product-details-route    
    CartComponent
// #docregion product-details-route    
  ],
  bootstrap:[
    AppComponent
  ]
})
export class AppModule { }
