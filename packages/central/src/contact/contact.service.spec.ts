import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRetailService } from '@seaccentral/core/dist/crm/contact.retail.service';
import {
  ContactCorporate,
  ContactRetail,
} from '@seaccentral/core/dist/crm/contact.entity';
import { ContactCorporateService } from '@seaccentral/core/dist/crm/contact.corporate.service';
import {
  CreateContactCorporateDto,
  CreateContactRetailDto,
} from '@seaccentral/core/dist/dto/CreateContact.dto';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';

const crmEndpointPath = 'http://example.com/fake/crm/path';
const server = setupServer(
  rest.post(crmEndpointPath, async (req, res, ctx) => {
    return res(
      ctx.json({
        ID: '6bb45920-3758-4093-8b54-186d9daeb454',
        'Date Import': '2021-05-13T07:58:03.4996484Z',
        Status: '200',
        Description: 'Receive Contact Success',
      }),
    );
  }),
);

describe('Contact Service', () => {
  let contactRetailService: ContactRetailService;
  let contactRetailRepository: Repository<ContactRetail>;
  let contactCorporateService: ContactCorporateService;
  let contactCorporateRepository: Repository<ContactCorporate>;
  let app: TestingModule;

  beforeAll(() => {
    server.listen();
  });

  beforeEach(async () => {
    app = await setupApp({
      CRM_RETAIL_PATH: crmEndpointPath,
      SIGNATURE_RETAIL: '',
      CRM_CORPORATE_PATH: crmEndpointPath,
      SIGNATURE_CORPORATE: '',
    });

    contactRetailService = app.get<ContactRetailService>(ContactRetailService);
    contactRetailRepository = app.get<Repository<ContactRetail>>(
      getRepositoryToken(ContactRetail),
    );
    contactCorporateService = app.get<ContactCorporateService>(
      ContactCorporateService,
    );
    contactCorporateRepository = app.get<Repository<ContactCorporate>>(
      getRepositoryToken(ContactCorporate),
    );
  });

  afterEach(async () => {
    await teardownApp(app);
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should be defined', () => {
    expect(contactRetailService).toBeDefined();
    expect(contactCorporateService).toBeDefined();
    expect(contactRetailRepository).toBeDefined();
    expect(contactCorporateRepository).toBeDefined();
  });

  describe('Get Contact', () => {
    it('Get all contact retail from repository', async () => {
      await contactRetailRepository.save({});

      const result = await contactRetailService.findAll();

      expect(result.length).toEqual(1);
    });

    it('Get all contact corporate from repository', async () => {
      await contactCorporateRepository.save({});

      const result = await contactCorporateService.findAll();

      expect(result.length).toEqual(1);
    });
  });

  describe('Create contact', () => {
    it('Contact Retail', async () => {
      const createContactRetailDto: CreateContactRetailDto = {
        firstname: '',
        lastname: '',
        leadformurl: '',
        phoneno: '02345678',
        email: 'test@mail.com',
      };

      await contactRetailService.create(createContactRetailDto);

      const contacts = await contactRetailRepository.find();
      const [contact] = contacts;
      expect(contacts.length).toEqual(1);
      expect(contact).toEqual(expect.objectContaining(createContactRetailDto));
    });

    it('Contact Corporate', async () => {
      const createContactCorporateDto: CreateContactCorporateDto = {
        companyIndustry: '1',
        NoOfEmployee: '1',
        firstname: '',
        lastname: '',
        leadformurl: '',
        phoneno: '02345678',
        email: 'test@mail.com',
      };

      await contactCorporateService.create(createContactCorporateDto);

      const contacts = await contactCorporateRepository.find();
      const [contact] = contacts;
      expect(contacts.length).toEqual(1);
      expect(contact).toEqual(
        expect.objectContaining(createContactCorporateDto),
      );
    });
  });
});
