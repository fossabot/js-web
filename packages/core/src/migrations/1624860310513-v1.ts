import { MigrationInterface, QueryRunner } from 'typeorm';

export class v11624860310513 implements MigrationInterface {
  name = 'v11624860310513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "district" ("id" integer NOT NULL, "districtCode" character varying(255) NOT NULL, "districtNameEn" character varying(255) NOT NULL, "districtNameTh" character varying(255) NOT NULL, "provinceId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_ee5cb6fd5223164bb87ea693f1e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "province_id_search_index" ON "district" ("provinceId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "province" ("id" integer NOT NULL, "provinceCode" character varying(255) NOT NULL, "provinceNameEn" character varying(255) NOT NULL, "provinceNameTh" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_4f461cb46f57e806516b7073659" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subdistrict" ("id" integer NOT NULL, "subdistrictCode" character varying(255) NOT NULL, "subdistrictNameEn" character varying(255) NOT NULL, "subdistrictNameTh" character varying(255) NOT NULL, "zipCode" character varying(255) NOT NULL, "provinceId" integer NOT NULL, "districtId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_da41c18667c64ebc71ca9a65bfb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "subdistrict_district_id_search_index" ON "subdistrict" ("districtId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "subdistrict_province_id_search_index" ON "subdistrict" ("provinceId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "login_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "maxAttempts" integer NOT NULL, "lockDuration" integer NOT NULL, CONSTRAINT "PK_6b42b8259eacb613aeaecf63a33" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "password_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "expireIn" integer NOT NULL, "notifyIn" integer NOT NULL, CONSTRAINT "PK_c676914dd0454fa1d3e8f0851b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "slug" character varying NOT NULL, "logo" character varying, "isIdentityProvider" boolean NOT NULL DEFAULT false, "isServiceProvider" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_a08804baa7c5d5427067c49a31f" UNIQUE ("slug"), CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_plan_category_enum" AS ENUM('subscription', 'lifetime')`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_plan_durationinterval_enum" AS ENUM('day', 'month', 'year')`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_plan_externalprovidertype_enum" AS ENUM('instancy')`,
    );
    await queryRunner.query(
      `CREATE TYPE "subscription_plan_packagetype_enum" AS ENUM('all_access', 'online', 'virtual')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "productId" character varying NOT NULL, "detail" text, "price" numeric(12,2) NOT NULL, "vatRate" numeric NOT NULL DEFAULT '0', "currency" character varying NOT NULL, "category" "subscription_plan_category_enum" NOT NULL DEFAULT 'subscription', "durationValue" integer, "durationInterval" "subscription_plan_durationinterval_enum", "isPublic" boolean NOT NULL DEFAULT true, "allowRenew" boolean NOT NULL DEFAULT false, "features" jsonb NOT NULL DEFAULT '{}', "externalProviderType" "subscription_plan_externalprovidertype_enum", "siteUrl" character varying, "siteId" character varying, "packageType" "subscription_plan_packagetype_enum", "memberType" character varying, "durationName" character varying, "membershipId" character varying, "membershipDurationId" character varying, "externalProviderId" uuid, CONSTRAINT "subscription_plan_productId_unique" UNIQUE ("productId"), CONSTRAINT "PK_5fde988e5d9b9a522d70ebec27c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "email" citext, "firstname" character varying(255), "lastname" character varying(255), "gender" character varying(1), "salutation" character varying, "companyname" character varying(255), "jobtitle" character varying(255), "phoneno" character varying(100), "products" character varying array NOT NULL DEFAULT '{}', "utm_source" character varying(255), "utm_medium" character varying(255), "utm_campaign_name" character varying(255), "channel_description" character varying(255), "tracking" character varying(255), "cookieid" character varying(255), "leadmessage" character varying(255), "utm_term" character varying(255), "utm_content" character varying(255), "originalurl" character varying(255), "taggedurl" character varying(255), "stateid" character varying(255), "sessionid" character varying(255), "campaginid" character varying(255), "campaginname" character varying(255), "promotiondetail" character varying(255), "leadformurl" character varying(255), "countryCode" character varying(100), "consent_mkt" boolean, "onCRM" boolean NOT NULL DEFAULT false, "companyIndustry" character varying(255), "NoOfEmployee" character varying(255), "telephone1" character varying(100), "fax" character varying(100), "emailcompany" citext, "skuname" character varying(255), "packagestartdate" TIMESTAMP WITH TIME ZONE, "packageenddate" TIMESTAMP WITH TIME ZONE, "coupon" character varying(255), "coupontype" character varying(255), "billingaddressth" character varying(255), "billingaddressen" character varying(255), "type" character varying NOT NULL, "skucode" character varying, "billingsubdistrictId" integer, CONSTRAINT "check_contact_email" CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$'), CONSTRAINT "check_contact_company_email" CHECK (emailcompany ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$'), CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5fd8dc11e0ec4b57364aaa0a6c" ON "contact" ("type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "parentId" uuid, CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "industry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "nameEn" character varying(255) NOT NULL, "nameTh" character varying(255) NOT NULL, "description" character varying(500), CONSTRAINT "PK_fc3e38485cff79e9fbba8f13831" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "range" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "start" integer NOT NULL, "end" integer NOT NULL, "nameEn" character varying(100) NOT NULL, "nameTh" character varying(100) NOT NULL, "description" character varying(500), "type" character varying NOT NULL, CONSTRAINT "PK_a0a1eb8dc140c99b397c8b1dbc1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c86fc3d0c349605fe8229b68b2" ON "range" ("type") `,
    );
    await queryRunner.query(
      `CREATE TYPE "user_title_enum" AS ENUM('mr', 'mrs', 'ms', 'khun')`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_gender_enum" AS ENUM('male', 'female', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "username" citext, "email" citext, "isEmailConfirmed" boolean NOT NULL DEFAULT false, "phoneNumber" character varying(100), "isPhoneNumberConfirmed" boolean NOT NULL DEFAULT false, "isTwoFactorEnabled" boolean NOT NULL DEFAULT false, "isLockedOut" boolean NOT NULL DEFAULT false, "lockoutEndDateUTC" TIMESTAMP WITH TIME ZONE, "accessFailedCount" integer NOT NULL DEFAULT '0', "emailVerificationKey" character varying, "dob" TIMESTAMP WITH TIME ZONE, "emailVerificationRequestDateUTC" TIMESTAMP WITH TIME ZONE, "passwordResetKey" text, "passwordResetRequestDateUTC" TIMESTAMP WITH TIME ZONE, "title" "user_title_enum", "firstName" character varying(255), "lastName" character varying(255), "gender" "user_gender_enum", "zipCode" character varying(50), "jobTitle" character varying(255), "department" character varying(255), "companyName" character varying(255), "skillsToImprove" character varying(500), "isActivated" boolean NOT NULL DEFAULT true, "lineId" character varying, "lineIdVisible" boolean NOT NULL DEFAULT false, "dobVisible" boolean NOT NULL DEFAULT false, "ageRangeId" uuid, "industryId" uuid, "companySizeRangeId" uuid, CONSTRAINT "UQ_f2578043e491921209f5dadd080" UNIQUE ("phoneNumber"), CONSTRAINT "email_check" CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$'), CONSTRAINT "CHK_3c1a1f342b136d9cabfc13090a" CHECK ("username" IS NOT NULL OR "email" IS NOT NULL), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "username_unique_index" ON "user" ("username") WHERE username IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "email_unique_index" ON "user" ("email") WHERE email IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "phoneNumber_unique_index" ON "user" ("phoneNumber") WHERE "phoneNumber" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "username_search_index" ON "user" ("username") `,
    );
    await queryRunner.query(
      `CREATE INDEX "email_search_index" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "group_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "groupId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "group_user_unique" UNIQUE ("userId", "groupId"), CONSTRAINT "PK_c637f43a6f0d7891fec59f4d7a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "description" character varying(500), CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "email" citext NOT NULL, "token" uuid NOT NULL, "acceptedAt" TIMESTAMP WITH TIME ZONE, "roleId" uuid NOT NULL, "invitedById" uuid, "organizationId" uuid, CONSTRAINT "UQ_e061236e6abd8503aa3890af94c" UNIQUE ("token"), CONSTRAINT "invitation_email_check" CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$'), CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "invitation_email_unique_index" ON "invitation" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "invitation_token_search_index" ON "invitation" ("token") `,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "organizationId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "organization_user_unique" UNIQUE ("userId", "organizationId"), CONSTRAINT "PK_b93269ca4d9016837d22ab6e1e0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "contactPerson" character varying(255) NOT NULL, "contactNumber" character varying(255) NOT NULL, "email" citext NOT NULL, "billingAddress" text NOT NULL, "country" character varying(255) NOT NULL, "isDefault" boolean NOT NULL, "districtId" integer, "subdistrictId" integer, "provinceId" integer, "userId" uuid NOT NULL, CONSTRAINT "email_check" CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$'), CONSTRAINT "PK_2a9547c7062edcb3034a1fb9ebf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "status" character varying(50) NOT NULL, "transactionRef" character varying NOT NULL, "amount" character varying(50) NOT NULL, "merchantId" character varying(50), "approvalCode" character varying(50), "ippPeriod" character varying(50), "ippInterestType" character varying(50), "ippInterestRate" character varying(50), "ippMerchantAbsorbRate" character varying(50), "invoiceNumber" character varying(255), "backendInvoiceNumber" character varying(255), "paymentChannel" character varying(255), "paymentResponseCode" character varying(255), "paymentResponseDescription" character varying(255), "currencyCode" character varying(50), "metaData" text, "orderId" uuid NOT NULL, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM('PENDING', 'PAID', 'COMPLETED', 'CANCELED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "status" "order_status_enum" NOT NULL, "planId" character varying, "externalOrderId" character varying, "issueTaxInvoice" boolean NOT NULL DEFAULT false, "invoiceNumber" character varying, "userId" uuid NOT NULL, "subscriptionPlanId" uuid NOT NULL, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "autoRenew" boolean NOT NULL DEFAULT false, "userId" uuid NOT NULL, "organizationId" uuid, "features" jsonb, "instancyUserId" character varying, "orderId" uuid, "subscriptionPlanId" uuid NOT NULL, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "tax_invoice_taxtype_enum" AS ENUM('ORGANIZATION', 'INDIVIDUAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "tax_invoice_officetype_enum" AS ENUM('HEAD_OFFICE', 'BRANCH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "taxType" "tax_invoice_taxtype_enum" NOT NULL, "officeType" "tax_invoice_officetype_enum" NOT NULL, "taxEntityName" character varying(255) NOT NULL, "headOfficeOrBranch" character varying(255), "taxId" character varying(255) NOT NULL, "taxAddress" text NOT NULL, "district" character varying(255) NOT NULL, "subDistrict" character varying(255) NOT NULL, "province" character varying(255) NOT NULL, "country" character varying(255) NOT NULL, "zipCode" character varying(255) NOT NULL, "orderId" uuid NOT NULL, CONSTRAINT "PK_c7bfca403a1f9a9d55cf1a1c92a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_provider_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "metadataKey" character varying, "certificateKey" character varying, "certificateFileName" character varying, "metadataFileName" character varying, "privateKeyKey" character varying, "forceAuthn" boolean NOT NULL DEFAULT false, "wantAssertionsSigned" boolean NOT NULL DEFAULT false, "isAuthnRequestsSigned" boolean NOT NULL DEFAULT false, "allowUnencryptedAssertions" boolean NOT NULL DEFAULT false, "issuer" character varying, "callbackUrl" character varying, "organizationId" uuid NOT NULL, CONSTRAINT "PK_96ea4a6aa368006a6e0e785eb0f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "identity_provider_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "nameidFormat" character varying, "idpLabel" character varying, "issuer" character varying, "ssoLoginUrl" character varying, "ssoLogoutUrl" character varying, "certificateKey" character varying, "metadataKey" character varying, "certificateFileName" character varying, "metadataFileName" character varying, "privateKeyKey" character varying, "forceAuthn" boolean NOT NULL DEFAULT false, "isAuthnRequestsSigned" boolean NOT NULL DEFAULT false, "allowUnencryptedAssertions" boolean NOT NULL DEFAULT false, "organizationId" uuid NOT NULL, CONSTRAINT "PK_2e52df4aa4cb655314031f3ca87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_auth_provider_provider_enum" AS ENUM('facebook', 'google', 'github', 'password', 'linkedIn', 'samlSSO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_auth_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "provider" "user_auth_provider_provider_enum" NOT NULL, "correlationKey" uuid, "accessToken" character varying, "hashedPassword" character varying, "passwordExpireDate" TIMESTAMP, "passwordExpiryNotificationSentAt" TIMESTAMP WITH TIME ZONE, "refreshToken" character varying, "externalUserId" character varying, "correlationKeyDate" TIMESTAMP, "userId" uuid NOT NULL, "organizationId" uuid, CONSTRAINT "REL_0fbad3e63c63aabb7cf292ac77" UNIQUE ("organizationId"), CONSTRAINT "PK_ed14f086d8dc7ded49deedfd830" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "external_user_provider_index" ON "user_auth_provider" ("externalUserId", "provider") WHERE provider != 'password' AND "externalUserId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3db3ff35c8499b46bf34cdac53" ON "user_auth_provider" ("userId", "provider") `,
    );
    await queryRunner.query(
      `CREATE TABLE "password_record" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "hashedPassword" character varying NOT NULL, "userAuthProviderId" uuid, CONSTRAINT "PK_ae66b936ebbf7b45e00abc0b5f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "policy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_5ad65e4ff971649343992959bd0" UNIQUE ("name"), CONSTRAINT "PK_9917b0c5e4286703cc656b1d39f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_policy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "roleId" uuid NOT NULL, "policyId" uuid NOT NULL, CONSTRAINT "role_policy_unique" UNIQUE ("roleId", "policyId"), CONSTRAINT "PK_b723275101037b5c4b14a176064" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "isDefault" boolean NOT NULL DEFAULT true, "userId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_session_provider_enum" AS ENUM('facebook', 'google', 'github', 'password', 'linkedIn', 'samlSSO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "provider" "user_session_provider_enum" NOT NULL, "refreshToken" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "UQ_3c95f5a4cbd3bc44736fa8e6a0d" UNIQUE ("refreshToken"), CONSTRAINT "PK_adf3b49590842ac3cf54cac451a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "refreshToken_unique_index" ON "user_session" ("refreshToken") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_third_party" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "userThirdPartyId" character varying NOT NULL, "userThirdPartyType" character varying NOT NULL, "additionalDetail" jsonb, "userId" uuid NOT NULL, CONSTRAINT "PK_eb48eb529218cf328fd1bfa68b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_upload_history_uploadtype_enum" AS ENUM('skip', 'update', 'replace')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_upload_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "file" character varying NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, "s3key" character varying, "uploadType" "user_upload_history_uploadtype_enum" NOT NULL, "organizationId" character varying, "created_by" uuid NOT NULL, CONSTRAINT "PK_9a1ffaaf6bbfd657a56643a9a1c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_closure" ("id_ancestor" uuid NOT NULL, "id_descendant" uuid NOT NULL, CONSTRAINT "PK_4a5e3199dda2f120bbf1f284b8f" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03ff75659547221561c52bd42c" ON "group_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_59bd78a23bbefd65cf24edef47" ON "group_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" ADD CONSTRAINT "FK_564cf71ad88d656683e7fbbc4eb" FOREIGN KEY ("externalProviderId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" ADD CONSTRAINT "FK_4f5c001f92c460ee97f14d126ee" FOREIGN KEY ("skucode") REFERENCES "subscription_plan"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" ADD CONSTRAINT "FK_986174205390968fe1e28b1df96" FOREIGN KEY ("billingsubdistrictId") REFERENCES "subdistrict"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "FK_105c4fcefc250c0e90f3677993b" FOREIGN KEY ("parentId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_2afa13419275ef43b059f982bab" FOREIGN KEY ("ageRangeId") REFERENCES "range"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_252df484ae213a9f5c122617422" FOREIGN KEY ("industryId") REFERENCES "industry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_1145905db8a1a26ac2c2f9f6bb1" FOREIGN KEY ("companySizeRangeId") REFERENCES "range"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user" ADD CONSTRAINT "FK_c668a68c15f16d05c2a0102a51d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user" ADD CONSTRAINT "FK_79924246e997ad08c58819ac21d" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_e507d9fd82b8cf78cf6f4c2b4d2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_603764233ba5c97400836665523" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_5c00d7d515395f91bd1fee19f32" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_user" ADD CONSTRAINT "FK_63562fe364ecc738a7be56a8444" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_user" ADD CONSTRAINT "FK_29586d245154770441881d8f4fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD CONSTRAINT "FK_0c34e9a660c80878948cc6e9cf3" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD CONSTRAINT "FK_cad2295061314c55814dffeabdf" FOREIGN KEY ("subdistrictId") REFERENCES "subdistrict"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD CONSTRAINT "FK_d618d43a395a0529e78ec521281" FOREIGN KEY ("provinceId") REFERENCES "province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" ADD CONSTRAINT "FK_0891304664247a5517efc4ab007" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_a6e45c89cfbe8d92840266fd30f" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_cd129f75ce262470f553e00ecd1" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_d65c1709c800e618bc9417eba02" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_6167033b14f2d24c0649b62effe" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_cc906b4bc892b048f1b654d2aa0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_8ccdfc22892c16950b568145d53" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" ADD CONSTRAINT "FK_c9911292ea2d1114893a70a4ad8" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_config" ADD CONSTRAINT "FK_b389a0408be65af65e4a71f7daf" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "identity_provider_config" ADD CONSTRAINT "FK_e35b14e3a418de56216203c66e2" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_provider" ADD CONSTRAINT "FK_af753835542c17ea9208c57c9ff" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_provider" ADD CONSTRAINT "FK_0fbad3e63c63aabb7cf292ac772" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_record" ADD CONSTRAINT "FK_5fd1d63e04c0f6f9bf3b5c1dd8a" FOREIGN KEY ("userAuthProviderId") REFERENCES "user_auth_provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_30898f089b316e02ecce54e0f01" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe" FOREIGN KEY ("policyId") REFERENCES "policy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session" ADD CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_third_party" ADD CONSTRAINT "FK_55d3be55a233b6e645ecb977d0a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_upload_history" ADD CONSTRAINT "FK_10de21a5cc4c7da14b01081d484" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_closure" ADD CONSTRAINT "FK_03ff75659547221561c52bd42c0" FOREIGN KEY ("id_ancestor") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_closure" ADD CONSTRAINT "FK_59bd78a23bbefd65cf24edef47e" FOREIGN KEY ("id_descendant") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_closure" DROP CONSTRAINT "FK_59bd78a23bbefd65cf24edef47e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_closure" DROP CONSTRAINT "FK_03ff75659547221561c52bd42c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_upload_history" DROP CONSTRAINT "FK_10de21a5cc4c7da14b01081d484"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_third_party" DROP CONSTRAINT "FK_55d3be55a233b6e645ecb977d0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session" DROP CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_30898f089b316e02ecce54e0f01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_record" DROP CONSTRAINT "FK_5fd1d63e04c0f6f9bf3b5c1dd8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_provider" DROP CONSTRAINT "FK_0fbad3e63c63aabb7cf292ac772"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_provider" DROP CONSTRAINT "FK_af753835542c17ea9208c57c9ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "identity_provider_config" DROP CONSTRAINT "FK_e35b14e3a418de56216203c66e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_config" DROP CONSTRAINT "FK_b389a0408be65af65e4a71f7daf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_invoice" DROP CONSTRAINT "FK_c9911292ea2d1114893a70a4ad8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_8ccdfc22892c16950b568145d53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_cc906b4bc892b048f1b654d2aa0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_6167033b14f2d24c0649b62effe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_d65c1709c800e618bc9417eba02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_cd129f75ce262470f553e00ecd1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_a6e45c89cfbe8d92840266fd30f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP CONSTRAINT "FK_0891304664247a5517efc4ab007"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP CONSTRAINT "FK_d618d43a395a0529e78ec521281"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP CONSTRAINT "FK_cad2295061314c55814dffeabdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_address" DROP CONSTRAINT "FK_0c34e9a660c80878948cc6e9cf3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_user" DROP CONSTRAINT "FK_29586d245154770441881d8f4fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_user" DROP CONSTRAINT "FK_63562fe364ecc738a7be56a8444"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_5c00d7d515395f91bd1fee19f32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_603764233ba5c97400836665523"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_e507d9fd82b8cf78cf6f4c2b4d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user" DROP CONSTRAINT "FK_79924246e997ad08c58819ac21d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user" DROP CONSTRAINT "FK_c668a68c15f16d05c2a0102a51d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_1145905db8a1a26ac2c2f9f6bb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_252df484ae213a9f5c122617422"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_2afa13419275ef43b059f982bab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "FK_105c4fcefc250c0e90f3677993b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" DROP CONSTRAINT "FK_986174205390968fe1e28b1df96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" DROP CONSTRAINT "FK_4f5c001f92c460ee97f14d126ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_plan" DROP CONSTRAINT "FK_564cf71ad88d656683e7fbbc4eb"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_59bd78a23bbefd65cf24edef47"`);
    await queryRunner.query(`DROP INDEX "IDX_03ff75659547221561c52bd42c"`);
    await queryRunner.query(`DROP TABLE "group_closure"`);
    await queryRunner.query(`DROP TABLE "user_upload_history"`);
    await queryRunner.query(`DROP TYPE "user_upload_history_uploadtype_enum"`);
    await queryRunner.query(`DROP TABLE "user_third_party"`);
    await queryRunner.query(`DROP INDEX "refreshToken_unique_index"`);
    await queryRunner.query(`DROP TABLE "user_session"`);
    await queryRunner.query(`DROP TYPE "user_session_provider_enum"`);
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP TABLE "role_policy"`);
    await queryRunner.query(`DROP TABLE "policy"`);
    await queryRunner.query(`DROP TABLE "password_record"`);
    await queryRunner.query(`DROP INDEX "IDX_3db3ff35c8499b46bf34cdac53"`);
    await queryRunner.query(`DROP INDEX "external_user_provider_index"`);
    await queryRunner.query(`DROP TABLE "user_auth_provider"`);
    await queryRunner.query(`DROP TYPE "user_auth_provider_provider_enum"`);
    await queryRunner.query(`DROP TABLE "identity_provider_config"`);
    await queryRunner.query(`DROP TABLE "service_provider_config"`);
    await queryRunner.query(`DROP TABLE "tax_invoice"`);
    await queryRunner.query(`DROP TYPE "tax_invoice_officetype_enum"`);
    await queryRunner.query(`DROP TYPE "tax_invoice_taxtype_enum"`);
    await queryRunner.query(`DROP TABLE "subscription"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "billing_address"`);
    await queryRunner.query(`DROP TABLE "organization_user"`);
    await queryRunner.query(`DROP INDEX "invitation_token_search_index"`);
    await queryRunner.query(`DROP INDEX "invitation_email_unique_index"`);
    await queryRunner.query(`DROP TABLE "invitation"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "group_user"`);
    await queryRunner.query(`DROP INDEX "email_search_index"`);
    await queryRunner.query(`DROP INDEX "username_search_index"`);
    await queryRunner.query(`DROP INDEX "phoneNumber_unique_index"`);
    await queryRunner.query(`DROP INDEX "email_unique_index"`);
    await queryRunner.query(`DROP INDEX "username_unique_index"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_gender_enum"`);
    await queryRunner.query(`DROP TYPE "user_title_enum"`);
    await queryRunner.query(`DROP INDEX "IDX_c86fc3d0c349605fe8229b68b2"`);
    await queryRunner.query(`DROP TABLE "range"`);
    await queryRunner.query(`DROP TABLE "industry"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP INDEX "IDX_5fd8dc11e0ec4b57364aaa0a6c"`);
    await queryRunner.query(`DROP TABLE "contact"`);
    await queryRunner.query(`DROP TABLE "subscription_plan"`);
    await queryRunner.query(`DROP TYPE "subscription_plan_packagetype_enum"`);
    await queryRunner.query(
      `DROP TYPE "subscription_plan_externalprovidertype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "subscription_plan_durationinterval_enum"`,
    );
    await queryRunner.query(`DROP TYPE "subscription_plan_category_enum"`);
    await queryRunner.query(`DROP TABLE "organization"`);
    await queryRunner.query(`DROP TABLE "password_setting"`);
    await queryRunner.query(`DROP TABLE "login_setting"`);
    await queryRunner.query(
      `DROP INDEX "subdistrict_province_id_search_index"`,
    );
    await queryRunner.query(
      `DROP INDEX "subdistrict_district_id_search_index"`,
    );
    await queryRunner.query(`DROP TABLE "subdistrict"`);
    await queryRunner.query(`DROP TABLE "province"`);
    await queryRunner.query(`DROP INDEX "province_id_search_index"`);
    await queryRunner.query(`DROP TABLE "district"`);
  }
}
