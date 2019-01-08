// #docplaster
import { Component } from '@angular/core';
// #docregion rxjs-imports
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-imports
// #docregion activated-route-import
import { ActivatedRoute } from '@angular/router';
// #enddocregion activated-route-import

// #docregion product-imports
import { ProductService } from '../product.service';
import { Product } from '../product';
// #enddocregion product-imports

// #docregion cart-imports
import { CartService } from '../../cart.service';
// #enddocregion cart-imports

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product: Observable<Product>;

// #docregion product-details, cart-service
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {
// #enddocregion cart-service
    this.product = this.route.paramMap
      .pipe(
        switchMap(params => this.productService.getOne(+params.get('productId')))
      );
  }
// #enddocregion product-details

// #docregion buy
  onBuy(product: Product) {
    this.cartService.add(product);
  }
// #enddocregion buy
// #docregion product, product-details, flags
}
// #enddocregion product, product-details, flags
