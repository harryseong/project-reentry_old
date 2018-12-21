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
import { HomeComponent } from './home/home.component';
import {AuthGuard} from './auth/auth.guard';
import { UsersComponent } from './admin/users/users.component';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { OrgCreateComponent } from './admin/organization/org-create/org-create.component';
import { OrgEditComponent } from './admin/organization/org-edit/org-edit.component';
import { OrgViewComponent } from './admin/organization/org-view/org-view.component';
import { HeaderComponent } from './header/header.component';
import { ServicesComponent } from './services/services.component';
import {HttpClientModule} from '@angular/common/http';
import { ServiceViewComponent } from './services/service-view/service-view.component';
import { ServicesCategoryComponent } from './services/services-category/services-category.component';
import { NearMeComponent } from './home/near-me/near-me.component';
import { HelpDialogComponent } from './footer/help-dialog/help-dialog.component';
import { ByCategoriesComponent } from './home/by-categories/by-categories.component';
import { OrgDeleteDialogComponent } from './admin/organization/org-view/org-delete-dialog/org-delete-dialog.component';

const appRoutes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'organization/all', component: OrganizationComponent, canActivate: [AuthGuard]},
      { path: 'organization/new', component: OrgCreateComponent, canActivate: [AuthGuard]},
      { path: 'organization/edit', component: OrgEditComponent, canActivate: [AuthGuard]},
      { path: 'organization/view/:name', component: OrgViewComponent, canActivate: [AuthGuard]},
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
      // { path: 'organization/all', component: OrganizationComponent},
      // { path: 'organization/new', component: OrgCreateComponent},
      // { path: 'organization/edit/:name', component: OrgEditComponent},
      // { path: 'organization/view/:name', component: OrgViewComponent},
      // { path: 'users', component: UsersComponent},
    ]
  },
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services/view/:serviceCategory', component: ServicesCategoryComponent },
  { path: 'service/view/:name', component: ServiceViewComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    OrganizationComponent,
    NavbarComponent,
    AdminComponent,
    HomeComponent,
    UsersComponent,
    DialogComponent,
    FooterComponent,
    AboutComponent,
    OrgCreateComponent,
    OrgEditComponent,
    OrgViewComponent,
    HeaderComponent,
    ServicesComponent,
    ServiceViewComponent,
    ServicesCategoryComponent,
    NearMeComponent,
    HelpDialogComponent,
    ByCategoriesComponent,
    OrgDeleteDialogComponent,
  ],
  imports: [
    RouterModule.forRoot(
        appRoutes,
        {
          enableTracing: true // <-- debugging purposes only
        }
    ),
    AngularFireModule.initializeApp(environment.firebase, 'project-reentry'),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    BrowserModule,
    BrowserAnimationsModule,
    FlexModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    MaterialModule,
  ],
  entryComponents: [
    DialogComponent,
    HelpDialogComponent,
    OrgDeleteDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
