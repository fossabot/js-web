import { isValidUUID } from './uuid';

describe('uuid', () => {
  describe('isValidUUID', () => {
    it('should be valid UUID', () => {
      expect(isValidUUID('bc62ecec-4e31-47e5-857f-11748cac3945')).toEqual(true);
      expect(isValidUUID('1a85e78c-2c22-4247-b038-46fb82cfda50')).toEqual(true);
      expect(isValidUUID('00ab2684-b08a-43bc-a5e3-30f3dba6ca2b')).toEqual(true);
      expect(isValidUUID('cd91dee4-31f2-4b45-bc1c-e75cb2879f96')).toEqual(true);
      expect(isValidUUID('bc62ecec-4e31-47e5-857f-11748cac394_')).toEqual(
        false,
      );
    });
  });
});
