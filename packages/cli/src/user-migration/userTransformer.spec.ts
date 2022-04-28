import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { Gender } from '@seaccentral/core/dist/user/Gender.enum';
import { TR01_User } from '../instancy/TR001_User';
import {
  email,
  gender,
  industry,
  isActive,
  phoneNumber,
  prefix,
  sanitizePhoneNumber,
} from './userTransformer';

describe('userTransformer', () => {
  describe('#email', () => {
    it('remove all whitespaces', () => {
      const input = { email: ' a a ' } as TR01_User;
      const output = email(input);

      expect(output).toEqual('aa');
    });

    it('covert to lower case', () => {
      const input = { email: 'A' } as TR01_User;
      const output = email(input);

      expect(output).toEqual('a');
    });

    it('deidentity: replace email to yopmail with expected value', () => {
      const input = { email: 'john.doe@example.com', user_id: 1 } as TR01_User;
      const output = email(input, true);

      expect(output).toEqual(`${input.user_id}.instancy@yopmail.com`);
    });
  });

  describe('#prefix', () => {
    it('Mr. -> mr', () => {
      const input = { prefix: 'Mr.' } as TR01_User;
      const output = prefix(input);

      expect(output).toEqual('mr');
    });

    it('Ms. -> ms', () => {
      const input = { prefix: 'Ms.' } as TR01_User;
      const output = prefix(input);

      expect(output).toEqual('ms');
    });

    it('Mrs. -> mrs', () => {
      const input = { prefix: 'Mrs.' } as TR01_User;
      const output = prefix(input);

      expect(output).toEqual('mrs');
    });

    it('Khun -> khun', () => {
      const input = { prefix: 'Khun' } as TR01_User;
      const output = prefix(input);

      expect(output).toEqual('khun');
    });

    it('null -> null', () => {
      const input = { prefix: null } as TR01_User;
      const output = prefix(input);

      expect(output).toEqual(null);
    });
  });

  describe('#phoneNumber', () => {
    it('PhoneNumber = null, Mobile = null returns null', () => {
      const input = { phone_number: null, mobile: null } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(null);
    });

    it('PhoneNumber = "-", Mobile = "-" returns null', () => {
      const input = { phone_number: '-', mobile: '-' } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(null);
    });

    it('PhoneNumber = <valid> returns <valid>', () => {
      const input = { phone_number: '0812345678' } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(input.phone_number);
    });

    it('PhoneNumber = null, Mobile = <valid> returns <valid>', () => {
      const input = { phone_number: null, mobile: '0812345678' } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(input.mobile);
    });

    it('PhoneNumber = "-", Mobile = <valid> returns <valid>', () => {
      const input = { phone_number: '-', mobile: '0812345678' } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(input.mobile);
    });

    it('PhoneNumber = <valid1>, Mobile = <valid2> returns <valid1>', () => {
      const input = {
        phone_number: '0812345678',
        mobile: '0898765432',
      } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(input.phone_number);
    });

    it('return null for non-mobile phone number in field PhoneNumber', () => {
      const input = { phone_number: '021234567' } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(null);
    });

    it('return null for non-mobile phone number in field Mobile', () => {
      const input = { mobile: '021234567' } as TR01_User;
      const output = phoneNumber(input);

      expect(output).toEqual(null);
    });
  });

  describe('#sanitizePhoneNumber', () => {
    it('remove -', () => {
      const input = '-0-';
      const output = sanitizePhoneNumber(input);

      expect(output).toEqual('0');
    });

    it('replace (+66) with 0', () => {
      const input = '(+66)(+66)';
      const output = sanitizePhoneNumber(input);

      expect(output).toEqual('00');
    });

    it('remove whitespace', () => {
      const input = ' 0 1 ';
      const output = sanitizePhoneNumber(input);

      expect(output).toEqual('01');
    });

    it('remove (', () => {
      const input = '((';
      const output = sanitizePhoneNumber(input);

      expect(output).toEqual('');
    });

    it('remove )', () => {
      const input = '))';
      const output = sanitizePhoneNumber(input);

      expect(output).toEqual('');
    });
  });

  describe('#industry', () => {
    it('WhichIndustryUWorkIn = null, return undefined', () => {
      const input = { work_industry: null } as TR01_User;
      const output = industry(input, []);

      expect(output).toBeUndefined();
    });

    it('WhichIndustryUWorkIn not exist in industries, return others', () => {
      const input = { work_industry: 'foo' } as TR01_User;
      const industries = [
        { nameEn: 'bar' } as Industry,
        { nameEn: 'Others' } as Industry,
      ];
      const output = industry(input, industries);

      expect(output).toBeDefined();
      expect(output as Industry).toEqual(industries[1]);
    });

    it('WhichIndustryUWorkIn exist in industries, return that element', () => {
      const input = { work_industry: 'foo' } as TR01_User;
      const industries = [{ nameEn: 'foo' } as Industry];
      const output = industry(input, industries);

      expect(output).toBeDefined();
      expect(output as Industry).toEqual(industries[0]);
    });
  });

  describe('#gender', () => {
    it('Male -> male', () => {
      const input = { gender: 'Male' } as TR01_User;
      const output = gender(input);

      expect(output).toEqual(Gender.Male);
    });

    it('Female -> female', () => {
      const input = { gender: 'Female' } as TR01_User;
      const output = gender(input);

      expect(output).toEqual(Gender.Female);
    });

    it('null -> null', () => {
      const input = { gender: null } as TR01_User;
      const output = gender(input);

      expect(output).toEqual(null);
    });
  });

  describe('#isActive', () => {
    it('Active -> true', () => {
      const input = { user_status: 'Active' } as TR01_User;
      const output = isActive(input);

      expect(output).toEqual(true);
    });

    it('Deactive -> false', () => {
      const input = { user_status: 'Deactive' } as TR01_User;
      const output = isActive(input);

      expect(output).toEqual(false);
    });

    it('<invalid> -> true', () => {
      const input = { user_status: 'foo' } as TR01_User;
      const output = isActive(input);

      expect(output).toEqual(true);
    });
  });
});
