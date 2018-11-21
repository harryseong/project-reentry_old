import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from '../material.module';
import { OrganizationComponent } from './admin/organization/organization.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexModule} from '@angular/flex-layout';
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

const appRoutes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'organizations', component: OrganizationComponent, canActivate: [AuthGuard]},
      { path: 'services', component: ServiceComponent, canActivate: [AuthGuard]},
    ]
  },
  { path: '', component: HomeComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    OrganizationComponent,
    NavbarComponent,
    AdminComponent,
    ServiceComponent,
    HomeComponent
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
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    MaterialModule,
  ],
  entryComponents: [
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
