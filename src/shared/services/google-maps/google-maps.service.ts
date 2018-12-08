import {Injectable} from '@angular/core';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  distanceMatrixService = new google.maps.DistanceMatrixService();

  constructor() { }
}
