import {Component, OnInit} from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {Router} from '@angular/router';
import {GoogleMapsService} from '../../../../shared/services/google-maps/google-maps.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {SnackBarService} from '../../../../shared/services/snackBar/snack-bar.service';
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
  styleUrls: ['./near-me.component.scss'],
  animations: [
    trigger('transitionAnimations', [
      transition('* => fadeIn', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 })),
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
  filterControlsVisible = false;
  loading = false;
  orgList: any[] = [];
  filteredOrgList: any[] = [];
  transition = '';
  selectAllSelected = false;

  constructor(private afAuth: AngularFireAuth,
              private firestoreService: FirestoreService,
              private snackBarService: SnackBarService,
              private router: Router,
              private googleMapsService: GoogleMapsService) { }

  ngOnInit() {
    this.firestoreService.services.valueChanges()
      .subscribe(services => this.serviceList = this.firestoreService._sort(services, 'service'));
    this.transition = 'fadeIn';
    this.servicesNearMeState = {
      display: false, loading: false, myLocationId: null, myLocation: null, serviceCategories: []};
    this.searchFilterControls = {distanceRadius: 25, noEligibilityRequirements: false,
      includeReligiousOrgs: true, showOnlyOrgsWithTransport: false};
  }

  selectAllToggle() {
    const selectedServices = this.servicesForm.get('services');
    if (selectedServices.value.includes('All Services')) {
      this.selectAllSelected = true;
      selectedServices.setValue([...this.serviceList.map(service => service.service), 'All Services']);
    } else {
      selectedServices.setValue([]);
    }
  }

  serviceSelection() {
    const selectedServices = this.servicesForm.get('services').value;

    // If "Select All" is selected and one option is unselected.
    if (this.selectAllSelected === true && selectedServices.length === this.serviceList.length) {
      this.selectAllSelected = false;
      const index = selectedServices.indexOf('All Services');
      if (index > -1) {
        selectedServices.splice(index, 1);
        this.servicesForm.get('services').setValue(selectedServices);
      }
    } else if (this.selectAllSelected === false && selectedServices.length === this.serviceList.length) {
      this.selectAllSelected = true;
      selectedServices.push('All Services');
      this.servicesForm.get('services').setValue(selectedServices);
    }
  }

  findServices() {
    const address = this.servicesForm.get('location').value;
    if (address !== '' && this.servicesForm.get('services').value.length > 0) {
      this.loading = true;
      this.codeAddress(address);
    }
  }

  /**
   * This function will take the inputted city or address and turn it into
   * @param address: city or address of user.
   */
  codeAddress(address: string) {
    this.geocoder.geocode( { 'address': address}, (results, status) => {
      if (status.toString() === 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent !== undefined ? stateAddressComponent.short_name : null;
        const selectedServices = this.servicesForm.get('services').value;
        if (state === 'MI') {
          this.servicesNearMeState.display = true;
          this.servicesNearMeState.myLocation = results[0].formatted_address;
          this.servicesNearMeState.myLocationId = results[0].place_id;
          this.servicesNearMeState.serviceCategories = selectedServices.includes('All Services') ? ['All Services'] : selectedServices;
          this.getAndFilterOrgs();
        } else if (state !== 'MI') {
          this.loading = false;
          const message = 'The location provided was not found to be in Michigan. Please input a Michigan city or address.';
          const action = 'OK';
          this.snackBarService.openSnackBar(message, action);
          this.servicesForm.get('location').reset();
        }
      } else {
        this.servicesNearMeState.loading = false;
        const message = results.length === 0 ? 'The provided location is not valid. Please try again.' :
          'The app could not reach geocoding services. Please refresh the page and try again.';
        this.servicesForm.get('location').reset();
        this.loading = false;
        const action = 'OK';
        this.snackBarService.openSnackBar(message, action);
        console.warn('Geocode was not successful for the following reason: ' + status);
        return null;
      }
    });
  }

  /**
   * Get orgs according to the user's choice of service categories.
   */
  getAndFilterOrgs() {
    this.firestoreService.organizations.valueChanges().subscribe(rsp => {
      const filteredOrgs = this.servicesForm.get('services').value.includes('All Services') ? rsp :
        rsp.filter(org => org.services.some(service => this.servicesNearMeState.serviceCategories.includes(service)));
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

                if (orgCount === filteredOrgs.length) {
                  const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                  // Sort orgs by distance.
                  this.orgList = filteredOrgs.sort((a, b) => {
                    return collator.compare(a.distance, b.distance);
                  });
                  this.filteredOrgList = Object.assign([], this.orgList);
                  this.updateFilter();
                  this.loading = false;
                }
              }
            }
          );
        });
      } else {
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
    this.searchFilterControls = {distanceRadius: 25, noEligibilityRequirements: false,
      includeReligiousOrgs: true, showOnlyOrgsWithTransport: false};
    this.orgList = this.filteredOrgList = [];
    this.filterControlsVisible = false;
    this.servicesForm.get('location').reset();
    this.servicesForm.get('services').reset();
  }
}
