import {Injectable, NgZone} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {UserService} from '../user/user.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  organizations: AngularFirestoreCollection<any>;
  services: AngularFirestoreCollection<any>;
  languages: AngularFirestoreCollection<any>;
  counties: AngularFirestoreCollection<any>;
  users: AngularFirestoreCollection<any>;

  constructor(private db: AngularFirestore, private router: Router, private userService: UserService, private zone: NgZone) {
    this.organizations = db.collection<any>('organizations');
    this.services = db.collection<any>('services');
    this.counties = db.collection<any>('counties');
    this.languages = db.collection<any>('languages');
    this.users = db.collection<any>('users');
  }

  _sort(array: string[], parameter: string): string[] {
    return Object.assign([], array)
      .sort((a, b) => (a[parameter] > b[parameter]) ? 1 : ((b[parameter] > a[parameter] ? -1 : 0)));
  }

  saveOrg(orgForm: any, showSnackBar: boolean) {
    this.organizations.add(orgForm.value)
      .then( () => {
        console.log('New organization was successfully saved: ' + orgForm.get('name').value);
        if (showSnackBar === true) {
          const message = 'New organization was successfully saved.';
          const action = 'OK';
          this.zone.run(() => {
            this.userService.openSnackBar(message, action, 4000);
            this.router.navigate(['/admin/organization/all']);
          });
        }
      });
  }

  updateOrg(orgForm: any, originalOrgName: string, showSnackBar: boolean) {
    const query = this.organizations.ref.where('name', '==', originalOrgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => this.organizations.doc(docSnapshot.id).set(orgForm.value));
        this.zone.run(() => this.router.navigate(['/admin/organization/view', orgForm.get('name').value]));
      }
    });
    console.log('Organization was successfully updated: ' + orgForm.get('name').value);
    if (showSnackBar === true) {
      const message = 'Organization was successfully updated.';
      const action = 'OK';
      this.zone.run(() => {
        this.userService.openSnackBar(message, action, 4000);
      });
    }
  }

  deleteOrg(orgName: string, showSnackBar: boolean) {
    const query = this.organizations.ref.where('name', '==', orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        console.log('Organization was deleted: ' + orgName);
        if (showSnackBar === true) {
          querySnapshot.forEach(docSnapshot => this.organizations.doc(docSnapshot.id).delete());
          this.router.navigate(['/admin/organization/all']);
          const message = orgName + ' has been deleted.';
          this.userService.openSnackBar(message, 'OK');
        }
      }
    });
  }
}
