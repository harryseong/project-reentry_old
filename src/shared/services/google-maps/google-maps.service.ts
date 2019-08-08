import {Injectable} from '@angular/core';
import {FirestoreService} from '../firestore/firestore.service';
import {SnackBarService} from '../snackBar/snack-bar.service';
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  geocoder = new google.maps.Geocoder();
  distanceMatrixService = new google.maps.DistanceMatrixService();

  constructor(private firestoreService: FirestoreService,
              private snackBarService: SnackBarService) {}

  codeAddressAndSave(address: string, orgForm: any) {
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
          this.firestoreService.saveOrg(orgForm, true);
        } else if (state !== 'MI') {
          console.warn('The address provided was not found to be in Michigan.');
          const message = 'The address provided was not found to be in Michigan. Please input a valid Michigan address.';
          const action = 'OK';
          this.snackBarService.openSnackBar(message, action);
        }
      } else {
        console.warn('Geocode was not successful for the following reason: ' + status);
        const message = results.length === 0 ? 'The provided address is not valid. Please try again.' :
          'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        this.snackBarService.openSnackBar(message, action);
      }
    });
  }

  codeAddressAndUpdate(address: string, originalOrgName: string, orgForm: any) {
    this.geocoder.geocode( { 'address': address}, (results, status) => {
      if (status.toString() === 'OK') {
        const stateAddressComponent = results[0].address_components.find(ac => ac.types.includes('administrative_area_level_1'));
        const state = stateAddressComponent !== undefined ? stateAddressComponent.short_name : null;
        if (state === 'MI') {
          // Get lat and lng of address and save them in Firestore.
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          orgForm.get('address').get('gpsCoords').get('lat').setValue(lat);
          orgForm.get('address').get('gpsCoords').get('lng').setValue(lng);
          this.firestoreService.updateOrg(orgForm, originalOrgName, true);
        } else if (state !== 'MI') {
          const message = 'The address provided was not found to be in Michigan. Please input a valid Michigan address.';
          const action = 'OK';
          this.snackBarService.openSnackBar(message, action);
        }
      } else {
        const message = results.length === 0 ? 'The provided address is not valid. Please try again.' :
          'The app could not reach geocoding services. Please refresh the page and try again.';
        const action = 'OK';
        this.snackBarService.openSnackBar(message, action);
        console.warn('Geocode was not successful for the following reason: ' + status);
        return null;
      }
    });
  }
}
