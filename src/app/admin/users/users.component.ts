import {Component, OnInit, ViewChild} from '@angular/core';
import {FirestoreService} from '../../../shared/services/firestore/firestore.service';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {DialogComponent} from '../../../shared/dialogs/dialog/dialog.component';
import {SnackBarService} from '../../../shared/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['email', 'role'];
  dataSource: MatTableDataSource<any>;
  userList: any[] = [];

  constructor(private db: FirestoreService,
              public dialog: MatDialog,
              private snackBarService: SnackBarService) { }

  ngOnInit() {
    this.db.users.valueChanges().subscribe(rsp => {
      this.userList = rsp;
      this.dataSource = new MatTableDataSource(rsp);
    });
  }

  sortData(sort: Sort) {
    const data = this.userList.slice();
    if (!sort.active || sort.direction === '') {
      this.userList = data;
      return;
    }

    this.userList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'email':
          return this.compare(a.email, b.email, isAsc);
        case 'role':
          return this.compare(a.role, b.role, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource = new MatTableDataSource(this.userList);
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

  editRole(email: string, role: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '20em',
      data: {
        dialogType: 'userRoles',
        email: email,
        role: role
      }
    });

    dialogRef.afterClosed().subscribe(message => {
      // If the result is not null, open confirmation snack-bar. Otherwise, the dialog was closed without clicking the save button.
      if (message != null) {
        this.snackBarService.openSnackBar(message, 'OK', 4000);
      }
      console.log('The dialog was closed');
    });
  }
}
