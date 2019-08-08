import { Injectable } from '@angular/core';
import {HelpDialogComponent} from '../../dialogs/help-dialog/help-dialog.component';
import {MatDialog} from '@angular/material';
import {OrgDeleteDialogComponent} from '../../dialogs/org-delete-dialog/org-delete-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

    openHelpDialog(): void {
        const dialogRef = this.dialog.open(HelpDialogComponent, {
            width: '30em',
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    openOrgDeleteDialog(orgName: string) {
        const dialogRef = this.dialog.open(OrgDeleteDialogComponent, {
            data: {orgName: orgName},
            width: '30em',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }
}
