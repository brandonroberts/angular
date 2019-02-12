// #docplaster
// #docregion complete, httpclient, rxjs-import
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// #enddocregion httpclient
import { map } from 'rxjs/operators';
// #enddocregion rxjs-import

import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
// #docregion httpclient-inject
export class ProductService {
  constructor(private http: HttpClient) { }
// #enddocregion httpclient-inject

// #docregion httpclient-get-all
  getAll() {
    return this.http.get<{ products: Product[] }>('/assets/products.json')
      .pipe(map(data => data.products));
  }
// #enddocregion httpclient-get-all, complete

// #docregion httpclient-get-one
  getOne(productId: number) {
    return this.getAll()
      .pipe(
        map(products => products.find(product => product.id === productId))
      );
  }
// #enddocregion httpclient-get-one
// #docregion complete, httpclient-inject
}
// #enddocregion complete, httpclient-inject
