// https://oozouhq.atlassian.net/browse/SEAC-966

export enum PasswordStatus {
  /**
   *  password was not used to authenticate any questionnaire
   */
  NotUsed = 'NotUsed',

  /**
   * password is used but the person is still responding (it is less than 40
   * minutes since the person started answering)
   */
  Answering = 'Ansering',

  /**
   * respondent started the questionnaire more than 40 minutes ago or did
   * not complete it
   */
  Missed = 'Missed',

  /**
   * respondent has completed the questionnaire and the results can be
   * found in the database
   */
  Used = 'Used',
}

export enum ResultStatus {
  /**
   * the result is valid
   */
  Valid = 'Valid',

  /**
   * it was not possible to produce result, because the answers were
   * inconsistent
   */
  Invalid = 'Invalid',

  /**
   * for any reason, we have not yet been able to check
   * the validity of the results
   */
  ResultNotYetGenerated = 'Result not yet generated',

  /**
   * the questionnaire was not completed yet
   */
  NA = 'N/A',
}

export interface CreateAssessmentRequestBody {
  /**
   * User id of the respondent to be tested.
   */
  userid: string;

  /**
   * The first name of the respondent to be tested.
   */
  name: string;

  /**
   * The family name of the respondent to be tested.
   */
  surname: string;

  /**
   * The email of the respondent to be tested.
   */
  email: string;

  /**
   * The assessment name of the respondent to be tested.
   */
  assessment_name: string;

  /**
   * Would like The assessment center to send a link to take the assessment
   * & report it to the respondent email.
   */
  notify_email?: boolean;

  /**
   * The language of the respondent to be tested.
   */
  language?: 'TH' | 'EN';
}

export interface CreateAssessmentResponseBody {
  /**
   * ID of the Assessment Center
   */
  assessmentid: string;

  /**
   * The assessment name of the respondent to be tested
   */
  assessment_name: string;

  /**
   * The link to take the assessment
   */
  assessment_link: string;

  /**
   * User id of the respondent to be tested
   */
  userid: string;

  /**
   * Current status of an assessment
   */
  password_status: PasswordStatus;

  /**
   * The response includes the status of the questionnaire result
   */
  result_status: ResultStatus;

  /**
   * The status of assessment.
   */
  status: 'Not Start' | 'In Progress' | 'Completed';

  /**
   * The link to download the report.
   */
  reporturl: string | null;

  /**
   * Date & Time to start the assessment.
   */
  answeringStart: string | null;

  /**
   *  Date & Time to create the assessment
   */
  createdDate: string;

  /**
   * Date & Time to update the status of the assessment.
   */
  updatedDate: string;
}

export type RegenerateAssessmentRequestBody = CreateAssessmentRequestBody;

export type RegenerateAssessmentResponseBody = CreateAssessmentResponseBody;
