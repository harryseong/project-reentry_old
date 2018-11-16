import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent {

  constructor(public dialogRef: MatDialogRef<LoginDialogComponent>) {}

  closeDialog(): void {
      this.dialogRef.close();
  }

  logIn(): void {
    alert('Logging in...');
  }

}
