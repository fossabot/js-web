/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */

import 'reflect-metadata';
import { Policy, POLICY_METADATA } from './policy.decorator';

describe('Policy', () => {
  it('should enhance class with expected policy array when decorating on class', () => {
    const myPolicy1 = 'myPolicy1';
    @Policy(myPolicy1)
    class MyClass {}

    const metadata = Reflect.getMetadata(POLICY_METADATA, MyClass);
    expect(metadata).toEqual([myPolicy1]);
  });

  it('should enhance method with expected policy array', () => {
    const myPolicy1 = 'myPolicy1';
    class MyClass {
      @Policy(myPolicy1)
      static method1() {}
    }

    const metadata = Reflect.getMetadata(POLICY_METADATA, MyClass.method1);
    expect(metadata).toEqual([myPolicy1]);
  });

  it('should enhance class with expected policy array when decorating multiple on class', () => {
    const myPolicy1 = 'myPolicy1';
    const myPolicy2 = 'myPolicy2';
    @Policy(myPolicy1)
    @Policy(myPolicy2)
    class MyClass {}

    const metadata = Reflect.getMetadata(POLICY_METADATA, MyClass);
    expect(metadata).toEqual(expect.arrayContaining([myPolicy1, myPolicy2]));
  });

  it('should enhance class with expected policy array when decorating multiple on method', () => {
    const myPolicy1 = 'myPolicy1';
    const myPolicy2 = 'myPolicy2';
    class MyClass {
      @Policy(myPolicy1)
      @Policy(myPolicy2)
      method() {}
    }

    const metadata = Reflect.getMetadata(
      POLICY_METADATA,
      MyClass.prototype.method,
    );
    expect(metadata).toEqual(expect.arrayContaining([myPolicy1, myPolicy2]));
  });
});
