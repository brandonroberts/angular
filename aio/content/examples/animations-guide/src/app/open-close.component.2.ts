import { Component } from '@angular/core';
import { trigger, transition, state, animate, style } from '@angular/animations';

@Component({
  selector: 'open-close-boolean-component',
// #docregion trigger-boolean
  animations: [
    trigger('openClose', [
      state('true', style({ height: '*' })),
      state('false', style({ height: '0px' })),
      transition('false <=> true', animate(500))
    ])
  ],
// #enddocregion trigger-boolean
  templateUrl: 'open-close.component.2.html',
  styleUrls: ['open-close.component.1.css']
})
export class OpenCloseComponent {
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
