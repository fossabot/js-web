/**
 * SCORM 2004 4th edition API
 *
 * https://oozouhq.atlassian.net/wiki/spaces/SEAC/pages/1716027428/Scorms+Player
 * https://docs.google.com/document/d/1G59ha5rIfgnDDiARvkhw6ofCUaz_5N-zAe6wZhJyRuE
 */
export interface ISCORM2004API {
  Initialize: () => boolean;
  Terminate: () => boolean;
  GetValue: (element: SCORM2004ELEM) => any;
  SetValue: (element: SCORM2004ELEM, val: any, init?: boolean) => boolean;
  Commit: () => boolean;
  GetLastError: () => any;
  GetErrorString: (errorCode: any) => any;
  GetDiagnostic: (errorCode: any) => any;
}
