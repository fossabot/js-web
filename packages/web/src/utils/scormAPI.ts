import { initSCORM12API, SCORM12ELEM } from './scorm12API';
import { initSCORM2004API, SCORM2004ELEM } from './scorm2004API';

// Generalized the keyword of both SCORM_API versions
export enum SCORM_API {
  LEARNER_ID = 'LEARNER_ID',
  CMI = 'CMI',
  LEARNER_NAME = 'LEARNER_NAME',
  LOCATION = 'LOCATION',
  STATUS = 'STATUS',
  SUSPEND_DATA = 'SUSPEND_DATA',
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

const Scorm2004Editions = {
  'CAM 1.3': 'CAM 1.3', // 2004 2nd Edition
  '2004 3rd Edition': '2004 3rd Edition',
  '2004 4th Edition': '2004 4th Edition',
};

const Scorm12Editions = { '1.2': '1.2' };

export const AllScormEditions = { ...Scorm2004Editions, ...Scorm12Editions };

export type ScormVersion =
  | keyof typeof Scorm12Editions
  | keyof typeof Scorm2004Editions;

export interface IParamsScormAPI {
  (
    scormVersion: ScormVersion,
    learner: any,
    onSetValue?: (element: string, val: any) => void,
  ): IScormAPI;
}

export interface IScormAPI {
  getValue: (
    element: SCORM_API,
  ) => string | boolean | number | Record<string, any>;
  setValue: (element: SCORM_API, val: any) => void;
}

export const scormAPI: IParamsScormAPI = (
  scormVersion,
  learner,
  onSetValue,
): IScormAPI => {
  const API = {
    getValue: (element: SCORM_API) => element,
    setValue: (element: SCORM_API, val) => {
      console.log({ element, val });
    },
  };

  if (scormVersion === '1.2') {
    const SCORM12API = initSCORM12API(learner, onSetValue);
    API.getValue = (element) => SCORM12API.LMSGetValue(SCORM12ELEM[element]);
    API.setValue = (element, val) =>
      SCORM12API.LMSSetValue(SCORM12ELEM[element], val);
  }
  // Scorm 2004 Variants
  else if (Object.values(Scorm2004Editions).includes(scormVersion)) {
    const SCORM2004API = initSCORM2004API(learner, onSetValue);
    API.getValue = (element) => SCORM2004API.GetValue(SCORM2004ELEM[element]);
    API.setValue = (element, val) =>
      SCORM2004API.SetValue(SCORM2004ELEM[element], val);
  }

  return API;
};

export const getScormVersionFromXML = (xmlDoc: Document) =>
  xmlDoc.getElementsByTagName('schemaversion')[0]?.textContent ??
  xmlDoc.getElementsByTagName('manifest')[0]?.getAttribute('version');
