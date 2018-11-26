import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AngularFirestore} from '@angular/fire/firestore';
import {DialogComponent} from '../../../../shared/dialog/dialog.component';

@Component({
  selector: 'app-org-view',
  templateUrl: './org-view.component.html',
  styleUrls: ['./org-view.component.css']
})
export class OrgViewComponent implements OnInit {
  roleForm = new FormGroup({
    role: new FormControl(this.data.role)
  });

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFirestore) { }

  ngOnInit() {}

  closeDialog() {
    this.dialogRef.close();
  }
}
