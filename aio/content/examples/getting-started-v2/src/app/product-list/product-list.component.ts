import { Component } from '@angular/core';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
// #docregion product
export class ProductListComponent {
  products = [
    {
      "id": 1,
      "name": "Phone XL",
      "price": "799",
      "description": "A large phone with one of the best screens"
    },
    {
      "id": 2,
      "name": "Phone Mini",
      "price": "699",
      "description": "A great phone with one of the best cameras"
    }
  ];

  selectedProduct;

  selectProduct(product) {
    this.selectedProduct = product;
  }

  share() {
    alert('The product has been shared!');
  }
}
