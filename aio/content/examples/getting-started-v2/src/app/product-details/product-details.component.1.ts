// #docregion imports
import { Component, Input, Output, EventEmitter } from '@angular/core';
// #enddocregion imports

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
// #docregion input-output
export class ProductDetailsComponent {
  @Input() product;
  @Output() share = new EventEmitter();
}
