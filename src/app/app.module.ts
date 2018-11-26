import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from '../material.module';
import { OrganizationComponent } from './admin/organization/organization.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule, FlexModule} from '@angular/flex-layout';
import {environment} from '../environments/environment';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireAuthModule} from '@angular/fire/auth';
import { NavbarComponent } from './navbar/navbar.component';
import { AdminComponent } from './admin/admin.component';
import {RouterModule, Routes} from '@angular/router';
import { ServiceComponent } from './admin/service/service.component';
import { HomeComponent } from './home/home.component';
import {AuthGuard} from './auth/auth.guard';
import { UsersComponent } from './admin/users/users.component';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { OrgCreateComponent } from './admin/organization/org-create/org-create.component';
import { OrgEditComponent } from './admin/organization/org-edit/org-edit.component';
import { OrgViewComponent } from './admin/organization/org-view/org-view.component';

const appRoutes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'organizations', component: OrganizationComponent, canActivate: [AuthGuard]},
      { path: 'organizations/new', component: OrgCreateComponent, canActivate: [AuthGuard]},
      { path: 'organizations/edit', component: OrgCreateComponent, canActivate: [AuthGuard]},
      { path: 'services', component: ServiceComponent, canActivate: [AuthGuard]},
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
    ]
  },
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    OrganizationComponent,
    NavbarComponent,
    AdminComponent,
    ServiceComponent,
    HomeComponent,
    UsersComponent,
    DialogComponent,
    FooterComponent,
    AboutComponent,
    OrgCreateComponent,
    OrgEditComponent,
    OrgViewComponent
  ],
  imports: [
    RouterModule.forRoot(
        appRoutes,
        { enableTracing: true } // <-- debugging purposes only
    ),
    AngularFireModule.initializeApp(environment.firebase, 'project-reentry'),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    BrowserModule,
    BrowserAnimationsModule,
    FlexModule,
    FlexLayoutModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    MaterialModule,
  ],
  entryComponents: [
    DialogComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
