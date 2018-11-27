import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {map} from 'rxjs/operators';
import {FirestoreService} from '../../../../shared/firestore/firestore.service';
import {switchMap} from 'rxjs-compat/operator/switchMap';

@Component({
  selector: 'app-org-view',
  templateUrl: './org-view.component.html',
  styleUrls: ['./org-view.component.css']
})
export class OrgViewComponent implements OnInit {
  orgName = '';
  org: any = null;

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
            org => this.org = org.data()
          );
        });
      }
    });
  }
}
