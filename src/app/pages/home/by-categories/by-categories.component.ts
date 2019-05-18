import { Component, OnInit } from '@angular/core';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-by-categories',
  templateUrl: './by-categories.component.html',
  styleUrls: ['./by-categories.component.css']
})
export class ByCategoriesComponent implements OnInit {
  serviceCategories: string[] = [];

  constructor(private firestoreService: FirestoreService, private router: Router) {
  }

  ngOnInit() {
    this.firestoreService.services.valueChanges()
      .subscribe(serviceCategories => this.serviceCategories = this.firestoreService._sort(serviceCategories, 'service'));
  }

  selectCategory(category: string) {
    this.router.navigate(['services/view/', category]);
  }
}
