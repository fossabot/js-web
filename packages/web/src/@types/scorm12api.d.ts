/**
 * SCORM 1.2 API
 * https://oozouhq.atlassian.net/wiki/spaces/SEAC/pages/1716027428/Scorms+Player
 * https://docs.google.com/document/d/1G59ha5rIfgnDDiARvkhw6ofCUaz_5N-zAe6wZhJyRuE
 */
export interface ISCORM12API {
  LMSInitialize: () => boolean;
  LMSFinish: () => boolean;
  LMSGetValue: (element: SCORM12ELEM) => any;
  LMSSetValue: (element: SCORM12ELEM, val: any, init?: boolean) => boolean;
  LMSCommit: () => boolean;
  LMSGetLastError: () => any;
  LMSGetErrorString: (errorCode: any) => any;
  LMSGetDiagnostic: (errorCode: any) => any;
}
