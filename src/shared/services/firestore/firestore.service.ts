import {Injectable, NgZone} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {SnackBarService} from '../snackBar/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  organizations: AngularFirestoreCollection<any>;
  services: AngularFirestoreCollection<any>;
  languages: AngularFirestoreCollection<any>;
  counties: AngularFirestoreCollection<any>;
  users: AngularFirestoreCollection<any>;

  constructor(private db: AngularFirestore,
              private router: Router,
              private snackBarService: SnackBarService) {
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
            this.snackBarService.openSnackBar(message, action, 4000);
            this.router.navigate(['/', 'admin', 'organization', 'all']);
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
        this.router.navigate(['/', 'admin', 'organization', 'view', orgForm.get('name').value]);
      }
    });
    console.log('Organization was successfully updated: ' + orgForm.get('name').value);
    if (showSnackBar === true) {
      const message = 'Organization was successfully updated.';
      const action = 'OK';
      this.snackBarService.openSnackBar(message, action, 4000);
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
            const action = 'OK';
            this.snackBarService.openSnackBar(message, action);
        }
      }
    });
  }

  updateCategoryViewCount(category: string) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const query = this.services.ref.where('service', '==', category);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          const id = docSnapshot.id;
          const data = docSnapshot.data();
          const incrementCount = () => {
            if (data.viewData[year] !== undefined) {
              if (data.viewData[year][month] !== undefined) {
                // Increment count for year-month.
                data.viewData[year][month]++;
              } else {
                // Create month entry and set count to 0.
                data.viewData[year][month] = 1;
              }
              // Update data on Firebase.
              this.services.doc(id).set(data);
            } else {
              // If year does not exist, create year entry.
              data.viewData[year] = {};
              this.services.doc(id).set(data).then(() => {
                // Create month entry and set count to 0.
                data.viewData[year][month] = 1;
                // Update data on Firebase.
                this.services.doc(id).set(data);
              });
            }
          };
          if (data.viewData !== undefined) {
            incrementCount();
          } else {
            data['viewData'] = {};
            this.services.doc(id).set(data).then(() => {
              incrementCount();
            });
          }
        });
      }
    });
  }

  updateOrgViewCount(orgName: string) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const query = this.organizations.ref.where('name', '==', orgName);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log('no documents found');
      } else {
        querySnapshot.forEach(docSnapshot => {
          const id = docSnapshot.id;
          const data = docSnapshot.data();
          const incrementCount = () => {
            if (data.viewData[year] !== undefined) {
              if (data.viewData[year][month] !== undefined) {
                // Increment count for year-month.
                data.viewData[year][month]++;
              } else {
                // Create month entry and set count to 0.
                data.viewData[year][month] = 1;
              }
              // Update data on Firebase.
              this.organizations.doc(id).set(data);
            } else {
              // If year does not exist, create year entry.
              data.viewData[year] = {};
              this.organizations.doc(id).set(data).then(() => {
                // Create month entry and set count to 0.
                data.viewData[year][month] = 1;
                // Update data on Firebase.
                this.organizations.doc(id).set(data);
              });
            }
          };
          if (data.viewData !== undefined) {
            incrementCount();
          } else {
            data['viewData'] = {};
            this.organizations.doc(id).set(data).then(() => {
              incrementCount();
            });
          }
        });
      }
    });
  }
}
