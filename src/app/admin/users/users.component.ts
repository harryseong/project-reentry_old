import {Component, OnInit, ViewChild} from '@angular/core';
import {FirestoreService} from '../../../shared/firestore/firestore.service';
import {MatDialog, MatPaginator, MatSnackBar, MatSort, MatTableDataSource, Sort} from '@angular/material';
import {DialogComponent} from './dialog/dialog.component';
import {UserService} from '../../../shared/user/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['email', 'role'];
  dataSource: MatTableDataSource<any>;
  userList: any[] = [];

  constructor(private firestoreService: FirestoreService, public dialog: MatDialog, private userService: UserService) { }

  ngOnInit() {
    this.firestoreService.users.valueChanges().subscribe(rsp => {
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
        email: email,
        role: role
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.userService.openSnackBar(result, 'OK');
      console.log('The dialog was closed');
    });
  }
}
