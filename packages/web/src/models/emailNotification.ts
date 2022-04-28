import { Language } from './language';
import * as Yup from 'yup';
import { EmailFormat } from './emailFormat';
import {
  ICategory,
  INotificationVariable,
  NotificationReceiverRole,
} from './notification';

export interface EmailNotification {
  id: string;
  title: string;
  subject: Language;
  bodyHTML: Language;
  senderEmailUser: string;
  senderEmailDomain: EmailNotificationSenderDomain;
  emailFormatEn: EmailFormat;
  emailFormatTh: EmailFormat;
  category: ICategory;
  receiverRoles: NotificationReceiverRole[];
  availableVariables: INotificationVariable[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface EmailNotificationListItem {
  id: string;
  title: string;
  triggerText: string;
  categoryName: string;
  isActive: boolean;
}

export interface EmailNotificationSenderDomain {
  id: string;
  domain: string;
}

const testAvailableVariables = (body, context) => {
  if (!body) return true;

  const emailNotification = context['from'][1].value;
  const { availableVariables } = emailNotification;
  const varRegex = /(?!\{\{)([A-Za-z0-9]+)(?=\}\})/gim;
  const matches = body.match(varRegex);

  if (!matches?.length) return true;

  return matches.every((m) => availableVariables.includes(m));
};

export const EmailNotificationValidationSchema = Yup.object({
  receiverRoles: Yup.array()
    .of(Yup.string())
    .min(1, 'Select at least one role'),
  senderEmailUser: Yup.string().required('required'),
  senderEmailDomainId: Yup.string().required('required'),
  emailFormatEnId: Yup.string().required('required'),
  emailFormatThId: Yup.string().required('required'),
  subject: Yup.object({
    nameEn: Yup.string().required('required'),
    nameTh: Yup.string().required('required'),
  }),
  bodyHTML: Yup.object({
    nameEn: Yup.string()
      .required('required')
      .test(
        'bodyMustContainsAllowedVariablesOnly',
        'emailNotificationEditorPage.bodyMustContainsAllowedVariablesOnly',
        testAvailableVariables,
      ),
    nameTh: Yup.string()
      .required('required')
      .test(
        'bodyMustContainsAllowedVariablesOnly',
        'emailNotificationEditorPage.bodyMustContainsAllowedVariablesOnly',
        testAvailableVariables,
      ),
  }),
  availableVariables: Yup.array().of(Yup.string()),
});

export type EmailNotificationEditorFormikType = Yup.InferType<
  typeof EmailNotificationValidationSchema
>;
