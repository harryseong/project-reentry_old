import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AngularFirestore} from '@angular/fire/firestore';
import {FirestoreService} from '../firestore/firestore.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  roleForm = new FormGroup({
    role: new FormControl(this.data.role)
  });
  languageList = [];
  serviceList = [];

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private db: AngularFirestore, private firestoreService: FirestoreService) {}
  ngOnInit() {
    this.firestoreService.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.firestoreService._sort(rsp, 'language'));
    this.firestoreService.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.firestoreService._sort(rsp, 'service'));
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

  delete(entityType: string, entityName: string) {
    let query = null;
    if (entityType === 'languages') {
      query = this.firestoreService.languages.ref.where('language', '==', entityName);
    } else if (entityType === 'services') {
      query = this.firestoreService.services.ref.where('service', '==', entityName);
    }
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => this.db.collection(entityType).doc(docSnapshot.id).delete());
      }
    });
  }
}
