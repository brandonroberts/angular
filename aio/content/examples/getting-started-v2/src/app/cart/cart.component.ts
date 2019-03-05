import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { DataService } from '../data.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  checkoutForm;
  items;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.checkoutForm = this.formBuilder.group({
      name: '',
      address: ''
    });

    this.items = this.dataService.getCartItems();
  }

  onSubmit(customerData) {
    // Process checkout data here
    console.log(customerData);
    alert('The order has been submitted');
  }
}
