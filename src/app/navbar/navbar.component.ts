import { Component, OnInit } from '@angular/core';
import {LoginDialogComponent} from '../login-dialog/login-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  // Open dialog with instructions when user clicks on the "Need to unsubscribe from a list?" link in the footer.
  openLoginDialog(): void {
      const dialogRef = this.dialog.open(LoginDialogComponent, {
          width: '20em',
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
      });
  }
}
