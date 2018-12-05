import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../../shared/firestore/firestore.service';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material';
import {animate, style, transition, trigger} from '@angular/animations';
import {UserService} from '../../shared/user/user.service';
import {Router} from '@angular/router';
declare var google: any;

/** Error when invalid control is dirty, touched, or submitted. */
export class SubscribeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('transitionAnimations', [
      transition('* => fadeIn', [
        style({ opacity: 0 }),
        animate(750, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  geocoder = new google.maps.Geocoder();
  serviceList: any[] = [];
  servicesForm = new FormGroup({
    location: new FormControl('', [Validators.required]),
    services: new FormControl([], [Validators.required]),
  });
  transition = '';

  constructor(private afAuth: AngularFireAuth, private firestoreService: FirestoreService, private userService: UserService,
              private zone: NgZone, private router: Router) { }

  ngOnInit() {
    this.firestoreService.services.valueChanges()
      .subscribe(services => this.serviceList = this.firestoreService._sort(services, 'service'));
    this.transition = 'fadeIn';
  }

  findServices() {
    const address = this.servicesForm.get('location').value;
    this.codeAddress(address);
  }

  codeAddress(address: string) {
    const router = this.router;
    const servicesForm = this.servicesForm;
    const userService = this.userService;
    const zone = this.zone;

    this.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent.short_name;
        if (state === 'MI') {
          const formattedAddress = results[0].formatted_address;
          zone.run(() => router.navigate(['/services/near'])).then();
        } else if (state !== 'MI') {
          const message = 'The location provided was not found to be in Michigan. Please input a Michigan city or address.';
          const action = 'OK';
          zone.run(() => {
            userService.openSnackBar(message, action);
          });
          servicesForm.get('location').reset();
        }
      } else {
        const message = 'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        zone.run(() => {
          userService.openSnackBar(message, action);
        });        console.warn('Geocode was not successful for the following reason: ' + status);
        return null;
      }
    });
  }
}
