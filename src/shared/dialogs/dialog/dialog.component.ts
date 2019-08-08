import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FirestoreService} from '../../services/firestore/firestore.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  // Fields for user roles.
  roleForm = new FormGroup({
    role: new FormControl(this.data.role)
  });
  // Fields for languages/services.
  languageList = [];
  serviceList = [];
  editMode = false;
  createMode = false;
  prevEntityName = '';
  languageForm = new FormGroup({
    language: new FormControl('')
  });
  serviceForm = new FormGroup({
    service: new FormControl('')
  });

  constructor(public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private db: FirestoreService) {}
  ngOnInit() {
    this.db.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.db._sort(rsp, 'language'));
    this.db.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.db._sort(rsp, 'service'));
  }

  cancel() {
    this.dialogRef.close();
  }

  saveRole() {
    const userDoc = this.db.users.doc(this.data.email);
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
    if (entityType === 'language') {
      query = this.db.languages.ref.where(entityType, '==', entityName);
    } else if (entityType === 'service') {
      query = this.db.services.ref.where(entityType, '==', entityName);
    }
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => this.db[entityType + 's'].doc(docSnapshot.id).delete());
      }
    });
  }

  enableEditMode(entityType: string, entityName: string) {
    this.prevEntityName = entityName;

    if (entityType === 'language') {
      this.languageForm.controls['language'].setValue(entityName);
    } else if (entityType === 'service') {
      this.serviceForm.controls['service'].setValue(entityName);
    }
    this.beginEditMode();
  }

  updateEntity(entityType: string) {
    let query = null;
    let newDoc = null;
    if (entityType === 'language') {
      query = this.db.languages.ref.where('language', '==', this.prevEntityName);
      newDoc = {language: this.languageForm.get(entityType).value};
    } else if (entityType === 'service') {
      query = this.db.services.ref.where('service', '==', this.prevEntityName);
      newDoc = {service: this.serviceForm.get(entityType).value};
    }
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => this.db[entityType + 's'].doc(docSnapshot.id).set(newDoc));
      }
    });
    this.endEditMode();
  }

  endEditMode() {
    this.editMode = false;
    this.resetForms();
  }
  beginEditMode() {
    this.editMode = true;
  }

  enableCreateMode(entityType: string) {
    if (entityType === 'language') {
      this.languageForm.controls['language'].setValue('');
    } else if (entityType === 'service') {
      this.serviceForm.controls['service'].setValue('');
    }
    this.beginCreateMode();
  }

  saveNewEntity(entityType: string) {
    let newDoc = null;
    if (entityType === 'language') {
      newDoc = {language: this.languageForm.get(entityType).value};
      this.db.languages.add(newDoc);
    } else if (entityType === 'service') {
      newDoc = {service: this.serviceForm.get(entityType).value};
      this.db.services.add(newDoc);
    }
    this.endCreateMode();
  }

  endCreateMode() {
    this.createMode = !this.createMode;
    this.resetForms();
  }
  beginCreateMode() {
    this.createMode = true;
  }

  resetForms() {
    this.languageForm.reset();
    this.serviceForm.reset();
  }
}
