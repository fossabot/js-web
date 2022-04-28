import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaMailBulk } from 'react-icons/fa';
import API_PATHS from '../constants/apiPaths';
import WEB_PATHS from '../constants/webPaths';
import useList from '../hooks/useList';
import { centralHttp } from '../http';
import useTranslation from '../i18n/useTranslation';
import { AdminLayout } from '../layouts/admin.layout';
import DropdownButton from '../ui-kit/DropdownButton';
import InvitedUserList from './InvitedUserList';

const InvitedUsersSection = ({}) => {
  const router = useRouter();
  const { data: invitations, totalPages } = useList<any>((options) =>
    centralHttp.get(API_PATHS.ADMIN_INVITED_USERS, { params: options }),
  );
  const [resendInvitationIds, setResendInvitationIds] = useState([]);
  const [isSelectAll, setSelectAll] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSelectAll) setResendInvitationIds(invitations.map((u) => u.id));
    else setResendInvitationIds([]);
  }, [isSelectAll]);

  const onClickSelect = (userId: string) => {
    if (resendInvitationIds.includes(userId))
      setResendInvitationIds(resendInvitationIds.filter((id) => id !== userId));
    else setResendInvitationIds([...resendInvitationIds, userId]);
  };

  async function onResend() {
    try {
      setSubmitting(true);
      await centralHttp.post(API_PATHS.RESEND_INVITATION, {
        ids: resendInvitationIds,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-10/12 text-right">
      <div className="align-items-start flex justify-between">
        <h2 className="mb-2 w-2/5 py-2 px-4 text-left font-bold text-black">
          Invited users
        </h2>
        <div className="flex w-3/5 flex-row justify-end">
          <button
            className="outline-none focus:outline-none w-2/6 cursor-pointer rounded bg-brand-primary py-2 px-4 font-bold text-white focus:ring"
            onClick={() => router.push(WEB_PATHS.ADMIN_INVITE_USER)}
          >
            Invite user
          </button>
          <DropdownButton
            wrapperClassNames={'mx-1 w-2/6'}
            buttonName={'Actions'}
            menuItems={[
              {
                name: 'Resend Invitation',
                action: onResend,
                isDisabled: resendInvitationIds.length < 1 || isSubmitting,
                activeIcon: (
                  <FaMailBulk
                    className="mr-2 h-5 w-5 text-yellow-300"
                    aria-hidden="true"
                  />
                ),
                inactiveIcon: (
                  <FaMailBulk
                    className="mr-2 h-5 w-5 text-yellow-300"
                    aria-hidden="true"
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
      <InvitedUserList
        users={invitations}
        onResendAction={onResend}
        resendInvitationIds={resendInvitationIds}
        totalPages={totalPages}
        onClickSelect={onClickSelect}
        isSelectAll={isSelectAll}
        setSelectAll={setSelectAll}
      />
    </div>
  );
};

const InvitationPage = () => {
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <Head>
        <title>{t('headerText')} | Invitations</title>
      </Head>
      <InvitedUsersSection />
    </AdminLayout>
  );
};

export default InvitationPage;
