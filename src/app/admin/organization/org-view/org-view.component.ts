import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {DialogService} from '../../../../shared/services/dialog/dialog.service';
declare var google: any;

@Component({
  selector: 'app-org-view',
  templateUrl: './org-view.component.html',
  styleUrls: ['./org-view.component.scss'],
  animations: [
  trigger('transitionAnimations', [
    transition(':enter', [
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

  constructor(private db: FirestoreService,
              private dialogService: DialogService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.orgName = this.route.snapshot.params['name'];
    const query = this.db.organizations.ref.where('name', '==', this.orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.warn('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          this.db.organizations.doc(docSnapshot.id).ref.get().then(
            org => {
              this.org = org.data();
              this.pageReady = true;
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

  openOrgDeleteDialog(orgName: string) {
      this.dialogService.openOrgDeleteDialog(orgName);
  }
}
