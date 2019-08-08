import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'convertTime'
})
export class ConvertTimePipe implements PipeTransform {

  transform(time: string): any {
      return moment(time, 'HH:mm').format('h:mm A');
  }

}
