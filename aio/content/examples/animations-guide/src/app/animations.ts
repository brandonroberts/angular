// #docregion
import { animation, style, animate } from "@angular/animations";

export const transAnimation = animation([
  style({
    height: "{{ height }}",
    opacity: "{{ opacity }}",
    backgroundcolor: "{{backgroundcolor}}"
  }),
  animate("{{ time }}")
]);