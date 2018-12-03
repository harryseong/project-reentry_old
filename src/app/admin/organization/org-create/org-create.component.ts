import {Component, NgZone, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {FirestoreService} from '../../../../shared/firestore/firestore.service';
import {ErrorStateMatcher, MatDialog} from '@angular/material';
import {DialogComponent} from '../../../../shared/dialog/dialog.component';
import {UserService} from '../../../../shared/user/user.service';
declare var google: any;

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
  geocoder = new google.maps.Geocoder();
  matcher: SubscribeErrorStateMatcher; // For form error matching.
  orgForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
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
    payment: new FormControl('', [Validators.required]),
    transportation: new FormControl('', [Validators.required]),
    seniorRequirements: new FormControl('', [Validators.required]),
    eligibilityRequirements: new FormControl('', [Validators.required]),
    bringWithYou: new FormControl('')
  });
  serviceList: any[] = [];
  languageList: any[] = [];
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  paymentOptions = ['Free', 'Insurance', 'Medicaid', 'Sliding Scale'];

  constructor(private firestoreService: FirestoreService, public dialog: MatDialog, private userService: UserService,
              private zone: NgZone) { }

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
      // If the result is not null, open confirmation snackBar. Otherwise, the dialog was closed without clicking the save button.
      if (result != null) {
        // this.openSnackBar(result, 'OK');
      }
      console.log('The dialog was closed');
    });
  }

  onSubmit() {
    const ac = this.orgForm.get('address');
    const fullAddress = ac.get('streetAddress1').value + ' ' + ac.get('streetAddress2').value +  ', ' +
      ac.get('city').value + ', ' + ac.get('state');
    this.codeAddress(fullAddress);
  }

  codeAddress(address: string) {
    const firestoreService = this.firestoreService;
    const orgForm = this.orgForm;
    const userService = this.userService;
    const zone = this.zone;

    this.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent.short_name;
        if (state === 'MI') {
          // Get lat and lng of address and save to them in Firestore.
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          orgForm.get('address').get('gpsCoords').get('lat').setValue(lat);
          orgForm.get('address').get('gpsCoords').get('lng').setValue(lng);
          firestoreService.organizations.add(orgForm.value);
        } else if (state !== 'MI') {
          const message = 'The address provided was not found to be in Michigan. Please input a Michigan address.';
          const action = 'OK';
          zone.run(() => {
            userService.openSnackBar(message, action);
          });
          orgForm.get('address').reset();
        }
      } else {
        const message = 'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        zone.run(() => {
          userService.openSnackBar(message, action);
        });
        console.warn('Geocode was not successful for the following reason: ' + status);
      }
    });
  }
}
