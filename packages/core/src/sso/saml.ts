// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as validator from '@authenio/samlify-xsd-schema-validator';
import * as saml from 'samlify';
import { v4 as uuidV4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

import { User } from '../user/User.entity';
import { build, parse } from '../utils/xml';
import { retrieveObjectFromS3 } from '../utils/s3';
import { IdentityProviderConfig } from './IdentityProviderConfig.entity';

saml.setSchemaValidator(validator);

const IDPAttributes = [
  {
    name: 'email',
    valueTag: 'user.email',
    nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
    valueXsiType: 'xs:string',
    valueXmlnsXs: 'urn:oasis:names:tc:SAML:2.0:assertion',
  },
  {
    name: 'firstname',
    valueTag: 'user.firstname',
    nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
    valueXsiType: 'xs:string',
    valueXmlnsXs: 'urn:oasis:names:tc:SAML:2.0:assertion',
  },
  {
    name: 'lastname',
    valueTag: 'user.lastname',
    nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
    valueXsiType: 'xs:string',
    valueXmlnsXs: 'urn:oasis:names:tc:SAML:2.0:assertion',
  },
  {
    name: 'login',
    valueTag: 'user.login',
    nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
    valueXsiType: 'xs:string',
    valueXmlnsXs: 'urn:oasis:names:tc:SAML:2.0:assertion',
  },
];

export function getServiceProviderEntityId(organizationSlug: string) {
  return `${process.env.AUTH_BASE_URL}/v1/sso/saml/${organizationSlug}/sp/metadata`;
}

export function getServiceProviderCallbackUrl(organizationSlug: string) {
  return `${process.env.AUTH_BASE_URL}/v1/sso/saml/${organizationSlug}/callback`;
}

export function getIdentityProviderEntityId(organizationSlug: string) {
  return `${process.env.AUTH_BASE_URL}/v1/sso/saml/${organizationSlug}/idp/metadata`;
}

export function getLocalServiceProvider(organizationSlug: string) {
  return saml.ServiceProvider({
    entityID: getServiceProviderEntityId(organizationSlug),
    assertionConsumerService: [
      {
        Binding: saml.Constants.namespace.binding.post,
        Location: getServiceProviderCallbackUrl(organizationSlug),
      },
    ],
  });
}

export async function getLocalIdentityProvider(
  organizationSlug: string,
  privateKeyKey: string,
  signingCertKey: string,
) {
  const privateKey = (await retrieveObjectFromS3(privateKeyKey)) as Buffer;
  const certificate = (await retrieveObjectFromS3(signingCertKey)) as Buffer;

  if (!privateKeyKey && !certificate) {
    throw new HttpException(
      'Identity provider is not setup for application',
      HttpStatus.BAD_REQUEST,
    );
  }

  return saml.IdentityProvider({
    entityID: getIdentityProviderEntityId(organizationSlug),
    privateKey,
    signingCert: certificate,
    singleSignOnService: [
      {
        Location: `${process.env.AUTH_BASE_URL}/v1/sso/saml/${organizationSlug}/login`,
        Binding: saml.Constants.namespace.binding.redirect,
      },
    ],
    singleLogoutService: [
      {
        Location: `${process.env.AUTH_BASE_URL}/v1/sso/saml/${organizationSlug}/logout`,
        Binding: saml.Constants.namespace.binding.redirect,
      },
    ],
    loginResponseTemplate: {
      context:
        '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="{ID}" Version="2.0" IssueInstant="{IssueInstant}" Destination="{Destination}"><saml:Issuer>{Issuer}</saml:Issuer><samlp:Status><samlp:StatusCode Value="{StatusCode}"/></samlp:Status><saml:Assertion ID="{AssertionID}" Version="2.0" IssueInstant="{IssueInstant}" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Issuer>{Issuer}</saml:Issuer><saml:Subject><saml:NameID Format="{NameIDFormat}">{NameID}</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData NotOnOrAfter="{SubjectConfirmationDataNotOnOrAfter}" Recipient="{SubjectRecipient}"/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="{ConditionsNotBefore}" NotOnOrAfter="{ConditionsNotOnOrAfter}"><saml:AudienceRestriction><saml:Audience>{Audience}</saml:Audience></saml:AudienceRestriction></saml:Conditions>{AttributeStatement}</saml:Assertion></samlp:Response>',
      attributes: IDPAttributes,
    },
    nameIDFormat: [
      'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    ],
  });
}

export function getServiceProviderByParams({
  callbackUrl,
  issuer,
  certificate,
  wantAssertionsSigned,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
  const additionalProps: any = {};

  if (wantAssertionsSigned) {
    additionalProps.wantAssertionsSigned = true;
    additionalProps.transformationAlgorithms = [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ];
  }

  return saml.ServiceProvider({
    ...additionalProps,
    entityID: issuer,
    signingCert: certificate || null,
    assertionConsumerService: [
      {
        Location: callbackUrl,
        Binding: saml.Constants.namespace.binding.post,
      },
    ],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIdentityProviderByMetadata(metadata: any) {
  return saml.IdentityProvider({ metadata });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getServiceProviderByMetadata(metadata: any) {
  const sp = saml.ServiceProvider({ metadata });

  if (sp.getEntitySetting().wantAssertionsSigned) {
    sp.entitySetting = {
      ...sp.entitySetting,
      transformationAlgorithms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/2001/10/xml-exc-c14n#',
      ],
    };
  }

  return sp;
}

export function getIdentityProviderByParams({
  issuer,
  ssoLoginUrl,
  certificate,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
Partial<IdentityProviderConfig> & { certificate: any }) {
  return saml.IdentityProvider({
    entityID: issuer,
    singleSignOnService: [
      {
        Binding: saml.Constants.namespace.binding.redirect,
        Location: ssoLoginUrl || '',
      },
    ],
    signingCert: certificate,
  });
}

export function tagReplacement(
  template: string,
  targetSP: saml.ServiceProviderInstance,
  assoIdp: saml.IdentityProviderInstance,
  user: User,
) {
  const now = new Date();
  const idpSetting = assoIdp.entitySetting;
  const spEntityID = targetSP.entityMeta.getEntityID();

  const fiveMinutesLater = new Date(now.getTime());
  fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
  const fiveMinutesLaterISO = new Date(fiveMinutesLater).toISOString();

  const id = uuidV4();
  const isoNow = now.toISOString();
  const acl = targetSP.entityMeta.getAssertionConsumerService('post');

  const tvalue = {
    ID: id,
    AssertionID: idpSetting.generateID ? idpSetting.generateID() : uuidV4(),
    Destination: acl,
    Audience: spEntityID,
    SubjectRecipient: acl,
    NameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    NameID: user.email,
    Issuer: assoIdp.entityMeta.getEntityID(),
    IssueInstant: isoNow,
    ConditionsNotBefore: isoNow,
    ConditionsNotOnOrAfter: fiveMinutesLaterISO,
    SubjectConfirmationDataNotOnOrAfter: fiveMinutesLaterISO,
    AssertionConsumerServiceURL: acl,
    EntityID: spEntityID,
    StatusCode: 'urn:oasis:names:tc:SAML:2.0:status:Success',
    // replace attribute
    attrUserEmail: user.email,
    attrUserFirstname: user.firstName,
    attrUserLastname: user.lastName,
    attrUserLogin: user.id,
  };

  return {
    id,
    context: saml.SamlLib.replaceTagsByValue(template, tvalue),
  };
}

export async function extendIDPMetadata(idpMetadata: string) {
  const parsedXML = await parse(idpMetadata);

  parsedXML.EntityDescriptor.IDPSSODescriptor[0] = {
    ...parsedXML.EntityDescriptor.IDPSSODescriptor[0],
    Attribute: [],
  };

  IDPAttributes.forEach((ia) => {
    const attr = {
      $: {
        Name: ia.name,
        NameFormat: ia.nameFormat,
        xmlns: ia.valueXmlnsXs,
      },
    };

    parsedXML.EntityDescriptor.IDPSSODescriptor[0].Attribute.push(attr);
  });

  return build({}, parsedXML);
}
