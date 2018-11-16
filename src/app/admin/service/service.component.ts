import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FirestoreService} from '../../../shared/firestore.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
    serviceForm = new FormGroup({
        service: new FormControl('')
    });
    serviceList: any[] = [];

    constructor(private firestoreService: FirestoreService) {
        this.firestoreService.services.valueChanges().subscribe(rsp => this.serviceList = rsp);
    }

    ngOnInit() {
    }

    onSubmit() {
        this.firestoreService.counties.add(this.serviceForm.value);
        this.serviceForm.reset();
    }

}
