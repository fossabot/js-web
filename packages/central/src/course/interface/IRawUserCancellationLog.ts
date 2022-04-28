import { Reason } from '@seaccentral/core/dist/course/UserCourseSessionCancellationLog.entity';

export interface IRawUserCancellationLog {
  usc_id: string;
  usc_isActive: boolean;
  usc_createdAt: Date;
  usc_updatedAt: Date;
  usc_userId: string;
  usc_courseSessionId: string;
  usc_reason: Reason;
  usc_cancelledByUserId: string;
  userId: string | null;
  expiryDate: Date | null;
}
