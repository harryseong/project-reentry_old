import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {Observable, Subscription} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {UserService} from '../../shared/user/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public dialog: MatDialog, public user: UserService) { }

  ngOnInit() {}

}
