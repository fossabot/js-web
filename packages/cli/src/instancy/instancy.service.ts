import { OnApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PoolClient } from 'pg';
import QueryStream from 'pg-query-stream';
import { INSTANCY_DB_CONNECTION } from './instancyDbConnection';
import { TR01_User } from './TR001_User';

export interface IAgeRangeResult {
  age_range: TR01_User['age_range'];
}

export interface IOrgNameResult {
  group_id: TR01_User['group_id'];
  org_name: TR01_User['org_name'];
}

@Injectable()
export class InstancyService implements OnApplicationShutdown {
  constructor(
    @Inject(INSTANCY_DB_CONNECTION)
    private readonly instancyDb: PoolClient,
  ) {}

  getAllUsers() {
    const columns = [
      'user_id',
      'group_id',
      'prefix',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'mobile',
      'age_range',
      'occupation',
      'current_job_title',
      'work_industry',
      'skills_to_improve',
      'company_name',
      'department',
      'org_name',
      'roles',
      'gender',
      'user_status',
    ];
    const query = new QueryStream(
      `SELECT DISTINCT ${columns.join(
        ',',
      )} FROM instancy_v2_users_master ORDER BY user_id`,
    ); // use DISTINCT to omit duplicate entries
    const stream = this.instancyDb.query(query);

    return stream;
  }

  getAllAgeRanges() {
    const query = new QueryStream(
      'SELECT age_range FROM instancy_v2_users_master GROUP BY age_range',
    );
    const stream = this.instancyDb.query(query);

    return stream;
  }

  getAllOrgNames() {
    const query = new QueryStream(
      'SELECT group_id, org_name FROM instancy_v2_users_master GROUP BY group_id, org_name ORDER BY group_id ASC',
    );
    const stream = this.instancyDb.query(query);

    return stream;
  }

  async onApplicationShutdown() {
    await this.instancyDb.release();
  }
}
