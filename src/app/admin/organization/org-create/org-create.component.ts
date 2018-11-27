import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {FirestoreService} from '../../../../shared/firestore/firestore.service';
import {ErrorStateMatcher, MatDialog} from '@angular/material';
import {DialogComponent} from '../../../../shared/dialog/dialog.component';

/** Error when invalid control is dirty, touched, or submitted. */
export class SubscribeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-org-create',
  templateUrl: './org-create.component.html',
  styleUrls: ['./org-create.component.css']
})
export class OrgCreateComponent implements OnInit {
  matcher: SubscribeErrorStateMatcher; // For form error matching.
  orgForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    services: new FormControl([], [Validators.required]),
    address: new FormGroup({
      streetAddress1: new FormControl('', [Validators.required]),
      streetAddress2: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('Michigan', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')])
    }),
    website: new FormControl('', [
      Validators.pattern('^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')
      ]),
    contact: new FormGroup({
      name: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl('', [Validators.pattern('^\\(?([0-9]{3})\\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$')]),
    }),
    hours: new FormControl(''),
    languages: new FormControl([]),
    payment: new FormControl('', [Validators.required]),
    transportation: new FormControl('', [Validators.required]),
    seniorRequirements: new FormControl('', [Validators.required]),
    eligibilityRequirements: new FormControl('', [Validators.required]),
    bringWithYou: new FormControl('')
  });
  serviceList: any[] = [];
  languageList: any[] = [];
  paymentOptions = ['Free', 'Insurance', 'Medicaid', 'Sliding Scale'];

  constructor(private firestoreService: FirestoreService, public dialog: MatDialog) { }

  ngOnInit() {
    this.firestoreService.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.firestoreService._sort(rsp, 'language'));
    this.firestoreService.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.firestoreService._sort(rsp, 'service'));
  }

  onSubmit() {
    alert(JSON.stringify(this.orgForm.value));
    this.firestoreService.organizations.add(this.orgForm.value);
    this.orgForm.reset();
  }

  editList( listType: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '30em',
      data: {
        dialogType: listType,
        list: listType === 'languages' ? this.languageList : this.serviceList
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      // If the result is not null, open confirmation snackBar. Otherwise, the dialog was closed without clicking the save button.
      if (result != null) {
        // this.openSnackBar(result, 'OK');
      }
      console.log('The dialog was closed');
    });
  }
}
