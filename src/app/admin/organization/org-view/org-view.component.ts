import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {ActivatedRoute} from '@angular/router';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import * as moment from 'moment';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatDialog} from '@angular/material';
import {OrgDeleteDialogComponent} from './org-delete-dialog/org-delete-dialog.component';
declare var google: any;

@Component({
  selector: 'app-org-view',
  templateUrl: './org-view.component.html',
  styleUrls: ['./org-view.component.css'],
  animations: [
  trigger('transitionAnimations', [
    transition('* => fadeIn', [
      style({ opacity: 0 }),
      animate(1000, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class OrgViewComponent implements OnInit {
  orgName = '';
  org: any = null;
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  pageReady = false;
  transition = '';

  constructor(private firestoreService: FirestoreService, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit() {
    this.orgName = this.route.snapshot.params['name'];
    const query = this.firestoreService.organizations.ref.where('name', '==', this.orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.warn('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          this.firestoreService.organizations.doc(docSnapshot.id).ref.get().then(
            org => {
              this.org = org.data();
              this.pageReady = true;
              this.transition = 'fadeIn';
              const gpsCoords = this.org.address.gpsCoords;
              const mapOption = {zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP};
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

  openOrgDeleteDialog(orgName: string) {
    const dialogRef = this.dialog.open(OrgDeleteDialogComponent, {
      data: {orgName: orgName},
      width: '30em',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
