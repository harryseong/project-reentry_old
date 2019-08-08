import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import {DialogComponent} from '../../../../shared/dialogs/dialog/dialog.component';
import {GoogleMapsService} from '../../../../shared/services/google-maps/google-maps.service';

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
  styleUrls: ['./org-create.component.scss']
})
export class OrgCreateComponent implements OnInit {
  matcher: SubscribeErrorStateMatcher; // For form error matching.
  orgForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    services: new FormControl([], [Validators.required]),
    specifyHours: new FormControl(false),
    hours: new FormGroup({
      Sunday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Monday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Tuesday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Wednesday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Thursday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Friday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Saturday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
    }),
    address: new FormGroup({
      streetAddress1: new FormControl('', [Validators.required]),
      streetAddress2: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('Michigan', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]),
      gpsCoords: new FormGroup({
        lat: new FormControl(''),
        lng: new FormControl(''),
      })
    }),
    website: new FormControl('', [
      Validators.pattern('^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')
      ]),
    contact: new FormGroup({
      name: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl('', [Validators.pattern('^\\(?([0-9]{3})\\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$')]),
    }),
    languages: new FormControl([]),
    payment: new FormControl(''),
    transportation: new FormControl(''),
    seniorRequirements: new FormControl(''),
    eligibilityRequirements: new FormControl(''),
    bringWithYou: new FormControl(''),
    additionalNotes: new FormControl('')
  });
  serviceList: any[] = [];
  languageList: any[] = [];
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  paymentOptions = ['Free', 'Insurance', 'Medicaid', 'Sliding Scale'];

  constructor(private firestoreService: FirestoreService,
              public dialog: MatDialog,
              private googleMapsService: GoogleMapsService) { }

  ngOnInit() {
    this.firestoreService.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.firestoreService._sort(rsp, 'language'));
    this.firestoreService.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.firestoreService._sort(rsp, 'service'));
    this.daysOfWeek.forEach(day => {
      this.toggleDay(day);
    });
  }
  specifyHours() {
    const hoursFormGroup = this.orgForm.get('hours');
    const specifyHours = this.orgForm.get('specifyHours').value;
    if (specifyHours === true) {
      this.daysOfWeek.forEach(day => {
        hoursFormGroup.get(day).get('open').setValue(true);
        this.toggleDay(day);
      });
    } else {
      this.daysOfWeek.forEach(day => {
        hoursFormGroup.get(day).get('open').setValue(false);
        this.toggleDay(day);
      });
    }
  }

  toggleDay(day: string) {
    const dayFormGroup = this.orgForm.get('hours').get(day);
    if (dayFormGroup.get('open').value === true) {
      dayFormGroup.get('start').enable();
      dayFormGroup.get('end').enable();
    } else {
      dayFormGroup.get('start').reset();
      dayFormGroup.get('start').disable();
      dayFormGroup.get('end').reset();
      dayFormGroup.get('end').disable();
    }
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
      // If the result is not null, open confirmation snack-bar. Otherwise, the dialog was closed without clicking the save button.
      if (result != null) {
        // this.openSnackBar(result, 'OK');
      }
      console.log('The dialog was closed');
    });
  }

  onSubmit() {
    const ac = this.orgForm.get('address');
    const fullAddress = ac.get('streetAddress1').value + ' ' + ac.get('streetAddress2').value +  ', ' +
      ac.get('city').value + ', ' + ac.get('state').value;
    this.googleMapsService.codeAddressAndSave(fullAddress, this.orgForm);
  }
}
