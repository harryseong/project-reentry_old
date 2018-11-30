import { Component, OnInit } from '@angular/core';
import {FirestoreService} from '../../shared/firestore/firestore.service';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
  animations: [
    trigger('transitionAnimations', [
      transition('* => fadeIn', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class ServicesComponent implements OnInit {
  serviceList = [];
  transition = '';

  constructor(private firestoreService: FirestoreService) {
  }

  ngOnInit() {
    this.firestoreService.services.valueChanges().subscribe(services => this.serviceList = services);
    this.transition = 'fadeIn';
  }
}
