import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {ActivatedRoute} from '@angular/router';
import {FirestoreService} from '../../../../shared/firestore/firestore.service';
declare var google: any;

@Component({
  selector: 'app-org-view',
  templateUrl: './org-view.component.html',
  styleUrls: ['./org-view.component.css']
})
export class OrgViewComponent implements OnInit {
  orgName = '';
  org: any = null;
  geocoder = new google.maps.Geocoder();

  constructor(private db: AngularFirestore, private firestoreService: FirestoreService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.orgName = this.route.snapshot.params['name'];
    const query = this.db.collection('organizations').ref.where('name', '==', this.orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.warn('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          this.db.collection('organizations').doc(docSnapshot.id).ref.get().then(
            org => {
              this.org = org.data();
              const mapOption = {zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP};
              const map = new google.maps.Map(document.getElementById('gMap'), mapOption);
              const oa = org.data().address;
              const address = oa.streetAddress1 + ' ' + oa.streetAddress2 + ', ' + oa.city + ', ' + oa.state + ' ' + oa.zipCode;
              this.codeAddress(address, map);
            }
          );
        });
      }
    });
  }

  codeAddress(address: string, map) {
    this.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        const marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }
}
