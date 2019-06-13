import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OrgAllComponent} from './admin/organization/org-all/org-all.component';
import {AuthGuard} from '../shared/auth/auth.guard';
import {OrgCreateComponent} from './admin/organization/org-create/org-create.component';
import {OrgEditComponent} from './admin/organization/org-edit/org-edit.component';
import {OrgViewComponent} from './admin/organization/org-view/org-view.component';
import {UsersComponent} from './admin/users/users.component';
import {HomeComponent} from './pages/home/home.component';
import {AboutComponent} from './pages/about/about.component';
import {ServicesCategoryComponent} from './pages/services/services-category/services-category.component';
import {ServiceViewComponent} from './pages/services/service-view/service-view.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
import {AdminLoginComponent} from './admin/admin-login/admin-login.component';

const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'login', component: AdminLoginComponent},
      { path: 'organization/all', component: OrgAllComponent, canActivate: [AuthGuard]},
      { path: 'organization/new', component: OrgCreateComponent, canActivate: [AuthGuard]},
      { path: 'organization/edit/:name', component: OrgEditComponent, canActivate: [AuthGuard]},
      { path: 'organization/view/:name', component: OrgViewComponent, canActivate: [AuthGuard]},
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
    ]
  },
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services/view/:serviceCategory', component: ServicesCategoryComponent },
  { path: 'service/view/:name', component: ServiceViewComponent },
  { path: '**', component: PageNotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
