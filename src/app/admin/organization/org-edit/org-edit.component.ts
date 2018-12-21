import {Component, NgZone, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {ErrorStateMatcher, MatDialog} from '@angular/material';
import {DialogComponent} from '../../../../shared/dialog/dialog.component';
import {UserService} from '../../../../shared/services/user/user.service';
import {ActivatedRoute, Router} from '@angular/router';
declare var google: any;

/** Error when invalid control is dirty, touched, or submitted. */
export class SubscribeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-org-edit',
  templateUrl: './org-edit.component.html',
  styleUrls: ['./org-edit.component.css']
})
export class OrgEditComponent implements OnInit {
  geocoder = new google.maps.Geocoder();
  matcher: SubscribeErrorStateMatcher; // For form error matching.
  orgForm: FormGroup = null;
  serviceList: any[] = [];
  languageList: any[] = [];
  orgName = '';
  org: any = null;
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  pageReady = '';
  paymentOptions = ['Free', 'Insurance', 'Medicaid', 'Sliding Scale'];

  constructor(private firestoreService: FirestoreService, public dialog: MatDialog, private userService: UserService,
              private zone: NgZone, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.firestoreService.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.firestoreService._sort(rsp, 'language'));
    this.firestoreService.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.firestoreService._sort(rsp, 'service'));

    this.orgName = this.route.snapshot.params['name'];
    const query = this.firestoreService.organizations.ref.where('name', '==', this.orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.warn('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          this.firestoreService.organizations.doc(docSnapshot.id).ref.get().then(
            org => {
              this.org = org.data();
              this.orgForm = new FormGroup({
                name: new FormControl(this.org.name, [Validators.required]),
                description: new FormControl(this.org.description),
                services: new FormControl(this.org.services, [Validators.required]),
                specifyHours: new FormControl(this.org.specifyHours),
                hours: new FormGroup({
                  Sunday: new FormGroup({
                    open: new FormControl(this.org.hours.Sunday.open),
                    start: new FormControl(this.org.hours.Sunday.start),
                    end: new FormControl(this.org.hours.Sunday.end)
                  }),
                  Monday: new FormGroup({
                    open: new FormControl(this.org.hours.Monday.open),
                    start: new FormControl(this.org.hours.Monday.start),
                    end: new FormControl(this.org.hours.Monday.end)
                  }),
                  Tuesday: new FormGroup({
                    open: new FormControl(this.org.hours.Tuesday.open),
                    start: new FormControl(this.org.hours.Tuesday.start),
                    end: new FormControl(this.org.hours.Tuesday.end)
                  }),
                  Wednesday: new FormGroup({
                    open: new FormControl(this.org.hours.Wednesday.open),
                    start: new FormControl(this.org.hours.Wednesday.start),
                    end: new FormControl(this.org.hours.Wednesday.end)
                  }),
                  Thursday: new FormGroup({
                    open: new FormControl(this.org.hours.Thursday.open),
                    start: new FormControl(this.org.hours.Thursday.start),
                    end: new FormControl(this.org.hours.Thursday.end)
                  }),
                  Friday: new FormGroup({
                    open: new FormControl(this.org.hours.Friday.open),
                    start: new FormControl(this.org.hours.Friday.start),
                    end: new FormControl(this.org.hours.Friday.end)
                  }),
                  Saturday: new FormGroup({
                    open: new FormControl(this.org.hours.Saturday.open),
                    start: new FormControl(this.org.hours.Saturday.start),
                    end: new FormControl(this.org.hours.Saturday.end)
                  }),
                }),
                address: new FormGroup({
                  streetAddress1: new FormControl(this.org.address.streetAddress1, [Validators.required]),
                  streetAddress2: new FormControl(this.org.address.streetAddress2),
                  city: new FormControl(this.org.address.city, [Validators.required]),
                  state: new FormControl(this.org.address.state, [Validators.required]),
                  zipCode: new FormControl(this.org.address.zipCode, [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]),
                  gpsCoords: new FormGroup({
                    lat: new FormControl(''),
                    lng: new FormControl(''),
                  })
                }),
                website: new FormControl(this.org.website, [
                  Validators.pattern('^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')
                ]),
                contact: new FormGroup({
                  name: new FormControl(this.org.contact.name),
                  email: new FormControl(this.org.contact.email, [Validators.email]),
                  phone: new FormControl(this.org.contact.phone,
                    [Validators.pattern('^\\(?([0-9]{3})\\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$')]),
                }),
                languages: new FormControl(this.org.languages),
                payment: new FormControl(this.org.payment, [Validators.required]),
                transportation: new FormControl(this.org.transportation, [Validators.required]),
                seniorRequirements: new FormControl(this.org.seniorRequirements, [Validators.required]),
                eligibilityRequirements: new FormControl(this.org.eligibilityRequirements, [Validators.required]),
                bringWithYou: new FormControl(this.org.bringWithYou),
                additionalNotes: new FormControl(this.org.additionalNotes)
              });
              this.daysOfWeek.forEach(day => {
                this.toggleDay(day);
              });
              this.pageReady = 'fadeIn';
            });
        });
      }
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
    const originalOrgName = this.orgName;
    const orgForm = this.orgForm;
    const router = this.router;
    const userService = this.userService;
    const zone = this.zone;

    this.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status.toString() === 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent.short_name;
        if (state === 'MI') {
          // Get lat and lng of address and save them in Firestore.
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          orgForm.get('address').get('gpsCoords').get('lat').setValue(lat);
          orgForm.get('address').get('gpsCoords').get('lng').setValue(lng);
          const query = firestoreService.organizations.ref.where('name', '==', originalOrgName);
          query.get().then(querySnapshot => {
            if (querySnapshot.empty) {
              console.log('no documents found');
            } else {
              querySnapshot.forEach(docSnapshot => firestoreService.organizations.doc(docSnapshot.id).set(orgForm.value));
              router.navigate(['/admin/organization/view', orgForm.get('name').value]);
            }
          });
          const message = 'New organization was successfully saved.';
          const action = 'OK';
          zone.run(() => {
            userService.openSnackBar(message, action, 4000);
          });
        } else if (state !== 'MI') {
          const message = 'The address provided was not found to be in Michigan. Please input a Michigan address.';
          const action = 'OK';
          zone.run(() => {
            userService.openSnackBar(message, action);
          });
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
