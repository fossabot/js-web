import { get, set } from 'lodash';

export enum SCORM12ELEM {
  LEARNER_ID = 'cmi.core.student_id',
  CMI = 'cmi',
  LEARNER_NAME = 'cmi.core.student_name',
  LOCATION = 'cmi.core.lesson_location',
  STATUS = 'cmi.core.lesson_status',
  SUSPEND_DATA = 'cmi.suspend_data',
  ENTRY = 'cmi.core.entry',
  EXIT = 'cmi.core.exit',
}

export function initSCORM12API(
  learner: any,
  onSetValue: (element: SCORM12ELEM, val: any) => void,
): ISCORM12API {
  window.API = {
    LMSInitialize: () => {
      window.API.LMSSetValue(SCORM12ELEM.CMI, learner.metadata, true);
      window.API.LMSSetValue(SCORM12ELEM.LEARNER_ID, learner.id, true);
      window.API.LMSSetValue(SCORM12ELEM.LEARNER_NAME, learner.name, true);
      window.API.LMSSetValue(SCORM12ELEM.LOCATION, learner.location, true);
      window.API.LMSSetValue(SCORM12ELEM.STATUS, learner.status, true);
      window.API.LMSSetValue(
        SCORM12ELEM.SUSPEND_DATA,
        learner.suspend_data,
        true,
      );
      window.API.LMSSetValue(SCORM12ELEM.EXIT, learner.exit, true);
      window.API.LMSSetValue(SCORM12ELEM.ENTRY, learner.entry, true);

      return true;
    },
    LMSFinish: () => {
      return true;
    },
    LMSGetValue: (element) => {
      return get(window.API, element, element === SCORM12ELEM.CMI ? {} : '');
    },
    LMSSetValue: (element, val, init) => {
      set(window.API, element, val);
      try {
        onSetValue && !init && onSetValue(element, val);
      } catch (e) {
        console.error(e);
        return false;
      }
      return true;
    },
    LMSCommit: () => {
      return true;
    },
    LMSGetLastError: () => {
      return 0;
    },
    LMSGetErrorString: (errocCode) => {
      return errocCode;
    },
    LMSGetDiagnostic: (errocCode) => {
      return errocCode;
    },
  };

  return window.API;
}
