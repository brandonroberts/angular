import {Component} from '@angular/core';
import {trigger, transition, state, animate, style} from '@angular/animations';

// #docregion component
@Component({
  selector: 'open-close-component',
  animations: [
    trigger('openClose', [
// #docregion trigger
// #docregion state1
      state('open', style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
// #enddocregion state1
// #docregion state2
      state('closed', style({
        height: '100px',
        opacity: 0.5,
        backgroundColor: 'green'
      })),
// #enddocregion state2
// #docregion transition1
      transition('open => closed', [
        animate('1s')
      ]),
// #enddocregion transition1
// #docregion transition2
      transition('closed => open', [
        animate('0.5s')
      ]),
      // #enddocregion trigger
// #enddocregion transition2
// #docregion transition3
      transition('* => *', [
        animate('1s')
      ]),
// #enddocregion transition3
// #docregion trigger
    ])
  ],
// #enddocregion trigger
  templateUrl: 'open-close.component.html',
  styleUrls: ['open-close.component.css']
})
export class OpenCloseComponent {
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
// #enddocregion component
