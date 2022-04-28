import { rest } from 'msw';
import { format, URL } from 'url';

function endpoints(basePath: string) {
  return [
    rest.post(
      `${basePath}/GetUserInfoByEmailForAllSites`,
      async (req, res, ctx) => {
        return res(ctx.xml(''));
      },
    ),
    rest.post(`${basePath}/CreateUser`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
    rest.post(`${basePath}/UpdateUser`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
    rest.post(`${basePath}/CopyUsertoASite`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
    rest.post(`${basePath}/UserMembershipDetails`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
    rest.post(`${basePath}/RenewMemebrship`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
    rest.post(`${basePath}/UpdateMemebrship`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
    rest.post(`${basePath}/UpdateMemebrship`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
    rest.post(`${basePath}/MembershipDetails`, async (req, res, ctx) => {
      return res(ctx.xml(''));
    }),
  ];
}

export const apiC23 = endpoints(
  format(new URL(process.env.INSTANCY_C23_BASE_URL as string), {
    search: false,
  }),
);
export const apiPkgAllAccess = endpoints(
  format(new URL(process.env.INSTANCY_ALL_ACCESS_PACKAGE_BASE_URL as string), {
    search: false,
  }),
);
export const apiPkgOnline = endpoints(
  format(new URL(process.env.INSTANCY_ONLINE_PACKAGE_BASE_URL as string), {
    search: false,
  }),
);
export const apiPkgVirtual = endpoints(
  format(new URL(process.env.INSTANCY_VIRTUAL_PACKAGE_BASE_URL as string), {
    search: false,
  }),
);
