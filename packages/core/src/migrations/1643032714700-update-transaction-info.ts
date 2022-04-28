import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration list
 * 1. status: from '000' -> '0000'
 * 2. amount: use Baht instead of Satang (cents)
 * 3. currencyCode: from '764' -> 'THB'
 * 4. paymentChannel '001' -> 'VI', '002' -> 'ETQ'
 * 5. paymentResponseCode '00' -> '0000'
 * 6. paymentResponseDescription 'Approved' -> 'Success'
 */
export class updateTransactionInfo1643032714700 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Note:
     * 1. Base on assumption that currencyCode = 764 is previous version since new 2C2P use 'THB' instead of number as code
     * 2. New 2C2P is more detailed on paymentChannel. Previously it was just to determine whether users paid with card.
     *    But newer version is detailed down to what type of card.
     *    So this migration will always assume that it VISA since there's no way to trace back.
     * 3. This migration does not handle fraction in amount. Just trim last 2 digits out.
     */
    await queryRunner.query(
      `
        UPDATE "transaction"
        SET 
        "status" = '0000',
        "paymentChannel" = 'VI',
        "paymentResponseCode" = '0000',
        "paymentResponseDescription" = 'Success'
        WHERE "currencyCode" = '764' AND "status" = '000' AND ("paymentChannel" = '001' OR "paymentChannel" = '005')
      `,
    );

    await queryRunner.query(
      `
        UPDATE "transaction"
        SET 
        "status" = '0000',
        "paymentChannel" = 'ETQ',
        "paymentResponseCode" = '0000',
        "paymentResponseDescription" = 'Success'
        WHERE "currencyCode" = '764' AND "status" = '000' AND "paymentChannel" = '002'
      `,
    );

    // Update currency code and amount to all records
    await queryRunner.query(
      `
        UPDATE "transaction"
        SET
        "amount" = SUBSTR("amount" , 0, LENGTH("amount") - 1),
        "currencyCode" = 'THB'
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
              UPDATE "transaction"
              SET 
              "status" = '000',
              "paymentChannel" = '001',
              "paymentResponseCode" = '000',
              "paymentResponseDescription" = 'Approved'
              WHERE "currencyCode" = 'THB' AND "status" = '0000' AND "paymentChannel" = 'VI'
            `,
    );

    await queryRunner.query(
      `
              UPDATE "transaction"
              SET 
              "status" = '000',
              "paymentChannel" = '002',
              "paymentResponseCode" = '000',
              "paymentResponseDescription" = 'Approved'
              WHERE "currencyCode" = 'THB' AND "status" = '0000' AND "paymentChannel" = 'ETQ'
            `,
    );

    // Update currency code and amount to all records
    await queryRunner.query(
      `
        UPDATE "transaction"
        SET
        "amount" = CONCAT("amount", '00'),
        "currencyCode" = '764'
      `,
    );
  }
}
