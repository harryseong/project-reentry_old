import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {DialogComponent} from '../../../../../shared/dialog/dialog.component';
import {FirestoreService} from '../../../../../shared/services/firestore/firestore.service';
import {UserService} from '../../../../../shared/services/user/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-org-delete-dialog',
  templateUrl: './org-delete-dialog.component.html',
  styleUrls: ['./org-delete-dialog.component.scss']
})
export class OrgDeleteDialogComponent {

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private firestoreService: FirestoreService, private userService: UserService, private router: Router) {}

  deleteOrg() {
    this.dialogRef.close();
    this.firestoreService.deleteOrg(this.data.orgName, true);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
