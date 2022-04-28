import { INestApplication } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { EntityManager, getMetadataArgsStorage } from 'typeorm';
import { pick, filter, get } from 'lodash';
import faker from 'faker';
import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { AgeRange } from '@seaccentral/core/dist/user/Range.entity';
import { TR01_User } from '../instancy/TR001_User';
import { UserMigrationService } from './userMigration.service';
import {
  afterAllApp,
  afterEachApp,
  beforeAllApp,
  beforeEachApp,
} from '../utils/test-helpers/setup';

async function makeInstancyUser(email2Identify: string, app: INestApplication) {
  const industry = faker.name.jobArea();
  await app
    .get(EntityManager)
    .getRepository(Industry)
    .insert({ nameEn: industry, nameTh: industry });
  const ageRange = `${faker.datatype.number()}`;
  await app
    .get(EntityManager)
    .getRepository(AgeRange)
    .insert({ start: -1, end: -1, nameEn: ageRange, nameTh: ageRange });

  return {
    user_id: faker.datatype.number(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    age_range: ageRange,
    current_job_title: faker.name.jobTitle(),
    skills_to_improve: faker.datatype.string(),
    company_name: faker.datatype.string(),
    department: faker.datatype.string(),

    email: email2Identify,
    prefix: 'Mr.',
    phone_number: '0812345678',
    mobile: '0812345678',
    work_industry: industry,
    gender: 'Male',
    user_status: 'Active',
  } as TR01_User;
}

describe('UserMigrationService', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await beforeAllApp();
  });

  beforeEach(async () => {
    await beforeEachApp(app);
  });

  afterEach(async () => {
    await afterEachApp(app);
  });

  afterAll(async () => {
    await afterAllApp(app);
  });

  describe('#updateMissingUserFields', () => {
    it('update to only user fields that is null', async () => {
      const userRepository = app.get(EntityManager).getRepository(User);
      const userMigrationService = app.get(UserMigrationService);
      const instancyUser = await makeInstancyUser('john.doe@mail.com', app);
      const insertResult = await userRepository.insert({
        email: 'john.doe@mail.com',
      });
      const user = await userRepository.findOneOrFail({
        relations: ['ageRange', 'industry'],
        where: { id: insertResult.identifiers[0].id },
      });

      await userMigrationService.setup();
      await userMigrationService.updateMissingUserFields(instancyUser, user);
      await userMigrationService.done();
      const updatedUser = await userRepository.findOneOrFail({
        relations: ['ageRange', 'industry'],
        where: { id: insertResult.identifiers[0].id },
      });

      const typeormColumnMeta = getMetadataArgsStorage().columns;
      const nullableFields = filter(typeormColumnMeta, {
        target: User,
        options: { nullable: true },
      }).map((col) => col.propertyName);
      const nonNullableFields = typeormColumnMeta
        .filter(
          (col) =>
            col.target === User && !nullableFields.includes(col.propertyName),
        )
        .map((col) => col.propertyName);
      const affectedFieldsFromUpdate = [
        'title',
        'firstName',
        'lastName',
        'phoneNumber',
        'ageRange',
        'jobTitle',
        'industry',
        'skillsToImprove',
        'companyName',
        'department',
        'gender',
      ];
      // all existing non-null values should be intact
      expect(pick(user, nonNullableFields)).toEqual(
        pick(updatedUser, nonNullableFields),
      );
      expect(updatedUser.email).toEqual(user.email); // this is important to make sure that email doesn't change
      affectedFieldsFromUpdate.forEach((field) => {
        const updatedValue = get(updatedUser, field);

        expect(updatedValue).not.toBeNull();
        expect(updatedValue).toBeDefined();
      });
    });
  });
});
