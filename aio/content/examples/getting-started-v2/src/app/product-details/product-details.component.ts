import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { DataService } from '../data.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product: any;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.product = this.route.paramMap.pipe(
      switchMap(params => this.dataService.getOne(+params.get('productId')))
    );
  }

  onBuy(product: any) {
    alert('Your item has been added to the cart!');

    this.dataService.addToCart(product);
  }
}
