import { Component, OnInit } from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
declare var google: any;

@Component({
  selector: 'app-service-view',
  templateUrl: './service-view.component.html',
  styleUrls: ['./service-view.component.css'],
  animations: [
    trigger('transitionAnimations', [
      transition('* => fadeIn', [
        style({ opacity: 0 }),
        animate(750, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class ServiceViewComponent implements OnInit {
  orgName = '';
  org: any = null;
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  pageReady = '';

  constructor(private firestoreService: FirestoreService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.orgName = this.route.snapshot.params['name'];
    this.firestoreService.updateOrgViewCount(this.orgName);
    const query = this.firestoreService.organizations.ref.where('name', '==', this.orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.warn('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          this.firestoreService.organizations.doc(docSnapshot.id).ref.get().then(
            org => {
              this.org = org.data();
              this.pageReady = 'fadeIn';
              const gpsCoords = this.org.address.gpsCoords;
              const mapOption = {zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP, draggable: false, clickableIcons: false,
                streetViewControl: false, streetViewControlOptions: false};
              const map = new google.maps.Map(document.getElementById('gMap'), mapOption);
              map.setCenter(gpsCoords);
              const marker = new google.maps.Marker({
                map: map,
                position: gpsCoords
              });
            });
        });
      }
    });
  }

  formatTime(time: string) {
    return moment(time, 'HH:mm').format('h:mm A');
  }
}
