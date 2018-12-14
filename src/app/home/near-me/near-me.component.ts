import {Component, NgZone, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../../../shared/services/firestore/firestore.service';
import {UserService} from '../../../shared/services/user/user.service';
import {Router} from '@angular/router';
import {GoogleMapsService} from '../../../shared/services/google-maps/google-maps.service';
import {animate, style, transition, trigger} from '@angular/animations';
declare var google: any;

/** Error when invalid control is dirty, touched, or submitted. */
export class SubscribeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface ServicesNearMeState {
  display: boolean;
  loading: boolean;
  myLocationId: any;
  myLocation: any;
  serviceCategories: string[];
}

export interface SearchFilterControls {
  distanceRadius: number;
  includeReligiousOrgs: boolean;
  noEligibilityRequirements: boolean;
  showOnlyOrgsWithTransport: boolean;
}

@Component({
  selector: 'app-near-me',
  templateUrl: './near-me.component.html',
  styleUrls: ['./near-me.component.css'],
  animations: [
    trigger('transitionAnimations', [
      transition('* => fadeIn', [
        style({ opacity: 0 }),
        animate(750, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class NearMeComponent implements OnInit {
  geocoder = new google.maps.Geocoder();
  serviceList: any[] = [];
  servicesForm = new FormGroup({
    location: new FormControl('', [Validators.required]),
    services: new FormControl([], [Validators.required]),
  });
  servicesNearMeState: ServicesNearMeState;
  searchFilterControls: SearchFilterControls;
  loading = false;
  orgList: any[] = [];
  filteredOrgList: any[] = [];
  transition = '';

  constructor(private afAuth: AngularFireAuth, private firestoreService: FirestoreService, private userService: UserService,
              private zone: NgZone, private router: Router, private googleMapsService: GoogleMapsService) { }

  ngOnInit() {
    this.firestoreService.services.valueChanges()
      .subscribe(services => this.serviceList = this.firestoreService._sort(services, 'service'));
    this.transition = 'fadeIn';
    this.servicesNearMeState = {
      display: false, loading: false, myLocationId: null, myLocation: null, serviceCategories: []};
    this.searchFilterControls = {distanceRadius: 120, noEligibilityRequirements: false,
      includeReligiousOrgs: true, showOnlyOrgsWithTransport: false};
  }

  findServices() {
    this.loading = true;
    const address = this.servicesForm.get('location').value;
    this.codeAddress(address);
  }

  /**
   * This function will take the inputted city or address and turn it into
   * @param address: city or address of user.
   */
  codeAddress(address: string) {
    this.geocoder.geocode( { 'address': address}, (results, status) => {
      if (status.toString() === 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent.short_name;
        if (state === 'MI') {
          this.servicesNearMeState.display = true;
          this.servicesNearMeState.myLocation = results[0].formatted_address;
          this.servicesNearMeState.myLocationId = results[0].place_id;
          this.servicesNearMeState.serviceCategories = this.servicesForm.get('services').value;
          this.servicesForm.reset();
          this.getAndFilterOrgs();
        } else if (state !== 'MI') {
          this.loading = false;
          const message = 'The location provided was not found to be in Michigan. Please input a Michigan city or address.';
          const action = 'OK';
          this.zone.run(() => {
            this.userService.openSnackBar(message, action);
          });
          this.servicesForm.get('location').reset();
        }
      } else {
        this.servicesNearMeState.loading = false;
        const message = 'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        this.zone.run(() => {
          this.userService.openSnackBar(message, action);
        });        console.warn('Geocode was not successful for the following reason: ' + status);
        return null;
      }
    });
  }

  /**
   * Get orgs according to the user's choice of service categories.
   */
  getAndFilterOrgs() {
    this.firestoreService.organizations.valueChanges().subscribe(rsp => {
      const filteredOrgs = rsp.filter(org =>
        org.services.some(service => this.servicesNearMeState.serviceCategories.includes(service)));
      let orgCount = 0;

      if (filteredOrgs.length > 0) {
        filteredOrgs.forEach(org => {
          this.googleMapsService.distanceMatrixService.getDistanceMatrix(
            {
              origins: [this.servicesNearMeState.myLocation],
              destinations: [org.address.gpsCoords],
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.IMPERIAL
            }, (response, status2) => {
              if (status2.toString() === 'OK') {
                org['distance'] = response.rows[0].elements[0].distance.text;
                this.orgList.push(org);
                orgCount++;
                console.log('Org Count: ' + orgCount);

                if (orgCount === filteredOrgs.length) {
                  console.log('Org Count: ' + orgCount + ' READY!');
                  const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                  // Sort orgs by distance.
                  this.orgList = filteredOrgs.sort((a, b) => {
                    return collator.compare(a.distance, b.distance);
                  });
                  this.filteredOrgList = Object.assign([], this.orgList);
                  this.updateFilter();
                  this.zone.run(() => {
                    this.loading = false;
                  });
                }
              }
            }
          );
        });
      } else {
        console.log('Org Count: ' + orgCount + ' NO ORGS!!');
        this.loading = false;
      }
    });
  }

  updateFilter() {
    this.filteredOrgList = Object.assign([], this.orgList);
    this.filteredOrgList = this.filteredOrgList
      .filter(org => org.distance.split(' mi')[0] <= this.searchFilterControls.distanceRadius);

    if (this.searchFilterControls.includeReligiousOrgs === false) {
      this.filteredOrgList = this.filteredOrgList
        .filter(org => !org.services.includes('Religious Organization'));
    }

    if (this.searchFilterControls.noEligibilityRequirements === true) {
      this.filteredOrgList = this.filteredOrgList
        .filter(org => !org.eligibilityRequirements && !org.seniorRequirements);
    }

    if (this.searchFilterControls.showOnlyOrgsWithTransport === true) {
      this.filteredOrgList = this.filteredOrgList.filter(org => org.transportation);
    }
  }

  back() {
    this.servicesNearMeState = {display: false, loading: false, myLocationId: null, myLocation: null, serviceCategories: []};
    this.searchFilterControls = {distanceRadius: 120, noEligibilityRequirements: false,
      includeReligiousOrgs: true, showOnlyOrgsWithTransport: false};
    this.orgList = this.filteredOrgList = [];
  }

}
