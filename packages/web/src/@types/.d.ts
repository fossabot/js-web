declare type GRecaptcha = import('./grecaptcha').GRecaptcha;
declare type JWPlayer = import('./jwplayer').JWPlayer;
declare type ISCORM2004API = import('./scorm2004api').ISCORM2004API;
declare type ISCORM12API = import('./scorm12api').ISCORM12API;

interface Window {
  jwplayer: JWPlayer;

  grecaptcha: GRecaptcha;

  API_1484_11: ISCORM2004API;

  API: ISCORM12API;
}
