import { Component, OnInit } from '@angular/core';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';

@Component({
  selector: 'app-by-categories',
  templateUrl: './by-categories.component.html',
  styleUrls: ['./by-categories.component.css']
})
export class ByCategoriesComponent implements OnInit {
  serviceCategories: string[] = [];

  constructor(private firestoreService: FirestoreService) {
  }

  ngOnInit() {
    this.firestoreService.services.valueChanges()
      .subscribe(serviceCategories => this.serviceCategories = this.firestoreService._sort(serviceCategories, 'service'));
  }
}
