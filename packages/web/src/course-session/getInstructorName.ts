import { ReactNode } from 'react';
import { ICourseSessionInstructor } from '../models/course';

export const getInstructorName = (
  instructor: ICourseSessionInstructor | null,
  t: (key: string) => string,
): ReactNode => {
  let render = null;

  if (!instructor) {
    render = t('courseSessionsPage.noInstructor');
  } else if (instructor.firstName) {
    render = instructor.firstName;
    if (instructor.lastName) {
      render += ` ${instructor.lastName}`;
    }
  } else if (instructor.email) {
    render = instructor.email;
  }

  return render;
};
