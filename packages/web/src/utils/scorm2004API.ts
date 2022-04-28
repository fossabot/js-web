import { get, set } from 'lodash';

export enum SCORM2004ELEM {
  LEARNER_ID = 'cmi.learner_id',
  CMI = 'cmi',
  LEARNER_NAME = 'cmi.learner_name',
  LOCATION = 'cmi.location',
  STATUS = 'cmi.completion_status',
  SUSPEND_DATA = 'cmi.suspend_data',
  ENTRY = 'cmi.entry',
  EXIT = 'cmi.exit',
}

export function initSCORM2004API(
  learner: any,
  onSetValue?: (element: SCORM2004ELEM, val: any) => void,
): ISCORM2004API {
  window.API_1484_11 = {
    Initialize: () => {
      window.API_1484_11.SetValue(SCORM2004ELEM.CMI, learner.metadata, true);
      window.API_1484_11.SetValue(SCORM2004ELEM.LEARNER_ID, learner.id, true);
      window.API_1484_11.SetValue(
        SCORM2004ELEM.LEARNER_NAME,
        learner.name,
        true,
      );
      window.API_1484_11.SetValue(
        SCORM2004ELEM.LOCATION,
        learner.location,
        true,
      );
      window.API_1484_11.SetValue(SCORM2004ELEM.STATUS, learner.status, true);
      window.API_1484_11.SetValue(
        SCORM2004ELEM.SUSPEND_DATA,
        learner.suspend_data,
      );
      window.API_1484_11.SetValue(SCORM2004ELEM.ENTRY, learner.entry, true);
      window.API_1484_11.SetValue(SCORM2004ELEM.EXIT, learner.exit, true);

      return true;
    },
    Terminate: () => {
      return true;
    },
    GetValue: (element) => {
      return get(window.API_1484_11, element, '');
    },
    SetValue: (element, val, init) => {
      set(window.API_1484_11, element, val);
      try {
        onSetValue && !init && onSetValue(element, val);
      } catch (e) {
        console.error(e);
        return false;
      }
      return true;
    },
    Commit: () => {
      return true;
    },
    GetLastError: () => {
      return 0;
    },
    GetErrorString: (errocCode) => {
      return errocCode;
    },
    GetDiagnostic: (errocCode) => {
      return errocCode;
    },
  };

  return window.API_1484_11;
}
