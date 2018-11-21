import {Component} from '@angular/core';
import {UserService} from '../shared/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'project-reentry';

  constructor() {}
}
