import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import {UsersComponent} from '../users.component';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  roleForm = new FormGroup({
    role: new FormControl(this.data.role)
  });

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFirestore) { }

  ngOnInit() {
  }

  saveRole() {
    const userDoc = this.db.collection('users').doc(this.data.email);
    const selectedRole = this.roleForm.get('role').value;
    userDoc.get().subscribe(
      doc => {
        userDoc.set({
          uid: doc.data().uid,
          email: doc.data().email,
          role: selectedRole
        });
      }
    );
    this.dialogRef.close(this.data.email + ' is now a' + (selectedRole === 'admin' ? 'n ' : ' ') + selectedRole + '.');
  }
}
