import { Component, OnInit } from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  animations: [
    trigger('transitionAnimations', [
      transition('* => fadeIn', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1, }))
      ])
    ])
  ],
})
export class AboutComponent implements OnInit {
  transition = '';
  constructor() { }

  ngOnInit() {
    this.transition = 'fadeIn';
  }

}