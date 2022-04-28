import { Injectable } from '@nestjs/common';
import { defaultTo } from 'lodash';

@Injectable()
export class Batch {
  private entries: any[] = [];

  public onFlush: (entries: any[]) => Promise<any> = () => Promise.resolve();

  constructor(
    private readonly size: number,
    onFlushHandler?: (entries: any[]) => Promise<any>,
  ) {
    this.onFlush = defaultTo(onFlushHandler, this.onFlush);
  }

  setOnFlush(fn: (entries: any[]) => Promise<any>) {
    this.onFlush = fn;
  }

  async add(entry: any) {
    if (this.entries.length > this.size) {
      await this.flush();
    }
    this.entries.push(entry);
  }

  async flush() {
    const tmp = this.entries;
    this.entries = [];
    await this.onFlush(tmp);
  }

  getEntries() {
    return this.entries;
  }
}
