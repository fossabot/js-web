import { PipeTransform } from '@nestjs/common';
import { groupBy, transform, merge } from 'lodash';

export class RecordDupeMergePipe implements PipeTransform {
  constructor(private readonly groupFn: (v: any) => unknown) {}

  transform(value: any) {
    value.records = this.mergeDuplicate(value.records);
    return value;
  }

  private mergeDuplicate(records: any[]) {
    const groups = groupBy(records, this.groupFn);
    return transform(
      groups,
      (result, group) => result.push(merge({}, ...group)),
      [] as any[],
    );
  }
}
