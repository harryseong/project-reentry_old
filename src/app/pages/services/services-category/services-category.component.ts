import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {ActivatedRoute, Router} from '@angular/router';
import {animate, style, transition, trigger} from '@angular/animations';
import {Location} from '@angular/common';

@Component({
  selector: 'app-services-category',
  templateUrl: './services-category.component.html',
  styleUrls: ['./services-category.component.scss'],
  animations: [
    trigger('transitionAnimations', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(750, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class ServicesCategoryComponent implements OnInit {
  displayedColumns: string[] = ['name', 'services', 'city'];
  dataSource: MatTableDataSource<any>;
  orgList: any[] = [];
  serviceCategory: string;
  loading = true;

  constructor(private db: FirestoreService,
              private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.serviceCategory = this.route.snapshot.params['serviceCategory'];
    this.db.updateCategoryViewCount(this.serviceCategory);
    this.db.organizations.valueChanges().subscribe(
      rsp => {
        this.orgList = rsp.filter(org => org.services.includes(this.serviceCategory));
        this.dataSource = new MatTableDataSource(this.orgList);
        this.loading = false;
        // Set custom filter predicate for searching nested fields of organization objects.
        this.dataSource.filterPredicate = (data, filter: string)  => {
          const accumulator = (currentTerm, key) => {
            return this.nestedFilterCheck(currentTerm, data, key);
          };
          const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
          // Transform the filter by converting it to lowercase and removing whitespace.
          const transformedFilter = filter.trim().toLowerCase();
          return dataStr.indexOf(transformedFilter) !== -1;
        };
      },
      error1 => console.error(error1),
      () => {}
    );
  }

  sortData(sort: Sort) {
    const data = this.orgList.slice();
    if (!sort.active || sort.direction === '') {
      this.orgList = data;
      return;
    }

    this.orgList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'city':
          return this.compare(a.address.city, b.address.city, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource = new MatTableDataSource(this.orgList);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  nestedFilterCheck(search, data, key) {
    if (typeof data[key] === 'object') {
      for (const k in data[key]) {
        if (data[key][k] !== null) {
          search = this.nestedFilterCheck(search, data[key], k);
        }
      }
    } else {
      search += data[key];
    }
    return search;
  }
}
