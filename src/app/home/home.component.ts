import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../../shared/services/firestore/firestore.service';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material';
import {animate, style, transition, trigger} from '@angular/animations';
import {UserService} from '../../shared/services/user/user.service';
import {Router} from '@angular/router';
declare var google: any;

/** Error when invalid control is dirty, touched, or submitted. */
export class SubscribeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface ServicesNearMe {
  display: boolean;
  loading: boolean;
  myLocation: any;
  serviceCategories: string[];
  orgList: any[];
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
  servicesNearMe: ServicesNearMe;
  transition = '';

  constructor(private afAuth: AngularFireAuth, private firestoreService: FirestoreService, private userService: UserService,
              private zone: NgZone, private router: Router) { }

  ngOnInit() {
    this.firestoreService.services.valueChanges()
      .subscribe(services => this.serviceList = this.firestoreService._sort(services, 'service'));
    this.transition = 'fadeIn';
    this.servicesNearMe = {display: false, loading: false, myLocation: null, serviceCategories: [], orgList: []};
  }

  findServices() {
    this.servicesNearMe.loading = true;
    const address = this.servicesForm.get('location').value;
    this.codeAddress(address);
  }

  codeAddress(address: string) {
    this.geocoder.geocode( { 'address': address}, (results, status) => {
      if (status.toString() === 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent.short_name;
        if (state === 'MI') {
          this.servicesNearMe.display = true;
          this.servicesNearMe.myLocation = results[0].place_id;
          this.servicesNearMe.serviceCategories = this.servicesForm.get('services').value;
          this.servicesForm.reset();
          this.firestoreService.organizations.valueChanges().subscribe(
            rsp => {
              this.servicesNearMe.orgList = rsp.filter(
                org => org.services.some(service => this.servicesNearMe.serviceCategories.includes(service)));
            }
          );
          this.servicesNearMe.loading = false;
        } else if (state !== 'MI') {
          this.servicesNearMe.loading = false;
          const message = 'The location provided was not found to be in Michigan. Please input a Michigan city or address.';
          const action = 'OK';
          this.zone.run(() => {
            this.userService.openSnackBar(message, action);
          });
          this.servicesForm.get('location').reset();
        }
      } else {
        this.servicesNearMe.loading = false;
        const message = 'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        this.zone.run(() => {
          this.userService.openSnackBar(message, action);
        });        console.warn('Geocode was not successful for the following reason: ' + status);
        return null;
      }
    });
  }

  back() {
    this.servicesNearMe = {display: false, loading: false, myLocation: null, serviceCategories: [], orgList: []};
  }
}
