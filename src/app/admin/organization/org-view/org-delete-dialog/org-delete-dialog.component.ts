import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DialogComponent} from '../../../../../shared/dialog/dialog.component';
import {FirestoreService} from '../../../../../shared/services/firestore/firestore.service';
import {UserService} from '../../../../../shared/services/user/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-org-delete-dialog',
  templateUrl: './org-delete-dialog.component.html',
  styleUrls: ['./org-delete-dialog.component.css']
})
export class OrgDeleteDialogComponent {

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private firestoreService: FirestoreService, private userService: UserService, private router: Router) {}

  deleteOrg() {
    this.dialogRef.close();
    const query = this.firestoreService.organizations.ref.where('name', '==', this.data.orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => this.firestoreService.organizations.doc(docSnapshot.id).delete());
        this.router.navigate(['/admin/organization/all']);
        const message = this.data.orgName + ' has been deleted.';
        this.userService.openSnackBar(message, 'OK');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
