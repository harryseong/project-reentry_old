import { Component, OnInit } from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {ActivatedRoute} from '@angular/router';
declare var google: any;

@Component({
  selector: 'app-service-view',
  templateUrl: './service-view.component.html',
  styleUrls: ['./service-view.component.scss'],
  animations: [
    trigger('transitionAnimations', [
      transition(':enter', [
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
  isLoading = true;

  constructor(private db: FirestoreService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.orgName = this.route.snapshot.params['name'];
    this.db.updateOrgViewCount(this.orgName);
    const query = this.db.organizations.ref.where('name', '==', this.orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.warn('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          this.db.organizations.doc(docSnapshot.id).ref.get().then(
            org => {
              this.org = org.data();
              this.isLoading = false;
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
}
