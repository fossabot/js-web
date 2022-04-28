import * as AWS from 'aws-sdk';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { LanguageCode } from '../language/Language.entity';
import { EmailFormat } from '../notification/EmailFormat.entity';
import { EmailNotification } from '../notification/EmailNotification.entity';
import { interpolate } from './interpolate';
import { getStringFromLanguage } from './language';

require('dotenv').config();

interface IDestination {
  email: string;
  templateData: AWS.SES.Types.TemplateData;
}
export interface ISendBulkEmailParams {
  destinations: IDestination[];
  source: string;
  templateName: string;
  defaultTemplateData: AWS.SES.Types.TemplateData;
}

let AWS_SES: AWS.SES;
let transporter: Transporter;

function init() {
  const isEnabled = process.env.ENABLE_AWS_SES === 'true';
  if (isEnabled) {
    AWS_SES = new AWS.SES({
      region: process.env.AWS_REGION || 'ap-southeast-1',
    });
    transporter = createTransport({
      SES: AWS_SES,
    });
  }
}

interface ISendNotificationEmail {
  from: string;
  html: string;
  text: string;
  subject: string;
  to: string | string[];
  options?: SendMailOptions;
}

export const sendNotificationEmail = async ({
  from,
  to,
  html,
  text,
  subject,
  options,
}: ISendNotificationEmail) => {
  // For local development where AWS_SES is disabled
  if (!transporter)
    return {
      response: '-',
    };

  return transporter.sendMail({
    ...options,
    from,
    to,
    subject,
    html,
    text,
  });
};

export const constructEmailFromTemplate = (params: {
  template: EmailNotification;
  format: EmailFormat;
  language: LanguageCode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacements: Record<string, any>;
}) => {
  const { template, format, language, replacements } = params;

  const subject = interpolate(
    getStringFromLanguage(template.subject, language),
    replacements,
  );

  const htmlBody = interpolate(
    getStringFromLanguage(template.bodyHTML, language),
    replacements,
    {
      noEscape: true,
    },
  );

  const generateHeader = () => {
    let header = '';
    if (format.headerImageKey) {
      header += `<tr style="padding-bottom: 32px;">
      <td>
        <img src="${process.env.CDN_URL}/${format.headerImageKey}" />
      </td>
    </tr>`;
    }
    return header;
  };

  const generateFooter = () => {
    let footer = `
    <tr>
      <td style="padding-bottom: 32px;">${format.teamName}</td>
    </tr>
    <tr>
      <td style="padding-bottom: 32px;">
        <div style="height: 1px; background-color: #D2D2D2; padding: 0;"></div>
      </td>
    </tr>`;

    if (format.footerImageKey) {
      footer += `<tr>
      <td style="padding-bottom: 32px;">
        <img src="${process.env.CDN_URL}/${format.footerImageKey}" />
      </td>
    </tr>`;
    }
    if (format.footerHTML) {
      footer += `<tr>
      <td>
        ${format.footerHTML}
      </td>
    </tr>`;
    } else if (format.footerText) {
      footer += `<tr>
      <td>
        ${format.footerText}
      </td>
    </tr>`;
    }
    return footer;
  };

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Poppins, sans-serif, 'Open Sans'; text-align: left; font-size: 12px; line-height: 16px;">
      <div style="max-width: 720px; margin: 0 auto;">
        <table style="background-color: #FBFBFB;  padding: 48px; border-radius: 16px;">
            ${generateHeader()}
            <tr><td>${htmlBody}</td></tr>
            ${generateFooter()}
          </table>
          ${
            format.copyrightText
              ? `<p style="padding: 32px 0; color: #C1C2C4; text-align: center; margin: 0;">
                ${format.copyrightText}
              </p>`
              : ''
          }
      </div>
    </body>
  </html>`;

  return { html, text: html.replace(/(<([^>]+)>)/gi, ''), subject };
};

init();

export const generateHtmlList = (listType: 'ul' | 'ol', list: string[]) => {
  return `<${listType}>${list.map((li) => `<li>${li}</li>`)}</${listType}>`;
};
