import { Component } from '@angular/core';
import { useAnimation, transition } from '@angular/animations';
import { transAnimation } from "./animations";


@Component({
  selector: '',
  animations: [
    transition('open => closed', [
      useAnimation(transAnimation, {
        height: 0,
        opacity: 1,
        backgroundcolor: 'red',
        time: '1s'
      })
    ])
  ]
})
export class SharedComponent {

}