import { Injectable } from '@angular/core';
import {HelpDialogComponent} from '../../dialogs/help-dialog/help-dialog.component';
import {MatDialog} from '@angular/material';

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
}
