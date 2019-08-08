import { Component, OnInit } from '@angular/core';
import {DialogComponent} from '../../../shared/dialog/dialog.component';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent {

  constructor(public dialogRef: MatDialogRef<DialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
