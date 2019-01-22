import {Injectable, NgZone} from '@angular/core';
import {UserService} from '../user/user.service';
import {FirestoreService} from '../firestore/firestore.service';
import {Router} from '@angular/router';
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  geocoder = new google.maps.Geocoder();
  distanceMatrixService = new google.maps.DistanceMatrixService();

  constructor(private userService: UserService, private zone: NgZone, private firestoreService: FirestoreService) { }

  codeAddressAndSave(address: string, orgForm: any) {
    const firestoreService = this.firestoreService;
    const userService = this.userService;
    const zone = this.zone;

    this.geocoder.geocode({ 'address': address}, (results, status) => {
      if (status.toString() === 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent !== undefined ? stateAddressComponent.short_name : null;
        if (state === 'MI') {
          // Get lat and lng of address and save them in Firestore.
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          orgForm.get('address').get('gpsCoords').get('lat').setValue(lat);
          orgForm.get('address').get('gpsCoords').get('lng').setValue(lng);
          firestoreService.saveOrg(orgForm, true);
        } else if (state !== 'MI') {
          console.warn('The address provided was not found to be in Michigan.');
          const message = 'The address provided was not found to be in Michigan. Please input a valid Michigan address.';
          const action = 'OK';
          zone.run(() => userService.openSnackBar(message, action));
        }
      } else {
        console.warn('Geocode was not successful for the following reason: ' + status);
        const message = results.length === 0 ? 'The provided address is not valid. Please try again.' :
          'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        zone.run(() => userService.openSnackBar(message, action));
      }
    });
  }

  codeAddressAndUpdate(address: string, originalOrgName: string, orgForm: any) {
    const firestoreService = this.firestoreService;
    const userService = this.userService;
    const zone = this.zone;

    this.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status.toString() === 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent !== undefined ? stateAddressComponent.short_name : null;
        if (state === 'MI') {
          // Get lat and lng of address and save them in Firestore.
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          orgForm.get('address').get('gpsCoords').get('lat').setValue(lat);
          orgForm.get('address').get('gpsCoords').get('lng').setValue(lng);
          firestoreService.updateOrg(orgForm, originalOrgName, true);
        } else if (state !== 'MI') {
          const message = 'The address provided was not found to be in Michigan. Please input a valid Michigan address.';
          const action = 'OK';
          zone.run(() => userService.openSnackBar(message, action));
        }
      } else {
        const message = results.length === 0 ? 'The provided address is not valid. Please try again.' :
          'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        zone.run(() => userService.openSnackBar(message, action));
        console.warn('Geocode was not successful for the following reason: ' + status);
        return null;
      }
    });
  }
}
