import { startOfDay } from 'date-fns';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import API_PATHS from '../constants/apiPaths';
import { notificationHttp } from '../http';
import { ITokenObject, IUser } from '../models/auth';
import { BaseResponseDto } from '../models/BaseResponse.dto';
import { ISystemAnnouncement } from '../models/systemAnnouncement';
import { SystemAnnouncementModal } from '../system-announcement/SystemAnnouncementModal';
import { captureError } from '../utils/error-routing';

interface ISystemAnnouncementContext {
  systemAnnouncement: ISystemAnnouncement | null;
}

const SystemAnnouncementContext =
  createContext<ISystemAnnouncementContext | undefined>(undefined);

interface ISystemAnnouncementContextProviderProps {
  children: ReactNode;
  token: ITokenObject | null;
}

const LOCAL_STORAGE_SYSTEM_ANNOUNCEMENT_VIEWED_KEY = 'SEAC@SYSTEM_ANNOUNCEMENT';

export const SystemAnnouncementContextProvider = ({
  children,
  token,
}: ISystemAnnouncementContextProviderProps) => {
  const [systemAnnouncement, setSystemAnnouncement] =
    useState<ISystemAnnouncement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (token?.user) {
      notificationHttp
        .get<BaseResponseDto<ISystemAnnouncement | null>>(
          API_PATHS.ACTIVE_SYSTEM_ANNOUNCEMENT,
        )
        .then(({ data }) => {
          const announcement = data.data;
          setSystemAnnouncement(announcement);

          const today = startOfDay(new Date()).getTime();

          const viewState = window.localStorage.getItem(
            LOCAL_STORAGE_SYSTEM_ANNOUNCEMENT_VIEWED_KEY,
          );

          let parsedViewState: Record<IUser['id'], string> | null = null;

          try {
            parsedViewState = JSON.parse(viewState) || {};
          } catch (err) {
            console.warn('Malformed system announcement state');
            window.localStorage.removeItem(
              LOCAL_STORAGE_SYSTEM_ANNOUNCEMENT_VIEWED_KEY,
            );
            parsedViewState = {};
          }

          // we have to reference announcement id just in case admin sets a new announcement on the day itself
          // this way we know it's a new announcement and we can show the modal again properly
          // Downside is that we have to refetch this API all the time
          const expectedViewState = `${announcement?.id || 'null'}@${
            announcement?.updatedAt || 'null'
          }@${today}`;

          if (
            announcement &&
            parsedViewState[token.user.id] !== expectedViewState
          ) {
            setIsModalOpen(true);

            // store view state in local storage to know if user has already seen
            // today's system announcement. If user has seen, don't fetch again
            window.localStorage.setItem(
              LOCAL_STORAGE_SYSTEM_ANNOUNCEMENT_VIEWED_KEY,
              JSON.stringify({
                ...parsedViewState,
                [token.user.id]: expectedViewState,
              }),
            );
          }
        })
        .catch((err) => {
          captureError(err);
        });
    }
  }, [token]);

  return (
    <SystemAnnouncementContext.Provider value={{ systemAnnouncement }}>
      {children}
      <SystemAnnouncementModal
        data={isModalOpen ? systemAnnouncement : null}
        onClose={() => setIsModalOpen(false)}
      />
    </SystemAnnouncementContext.Provider>
  );
};

export const useSystemAnnouncement = () => {
  return useContext(SystemAnnouncementContext);
};
