export class TR01_User {
  user_id: number;

  site_id: number;

  group_id: number;

  /**
   * User.userTitle
   * Mr. -> mr
   * Ms. -> ms
   * Mrs. -> mrs
   * Khun -> khun
   */
  prefix: string | null;

  /**
   * User.firstMame
   */
  first_name: string;

  /**
   * User.lastName
   */
  last_name: string;

  nick_name: string | null;

  /**
   * User.email
   */
  email: string;

  /**
   * User.phoneNumber
   * - = null
   */
  phone_number: string | null;

  /**
   * User.phoneNumber
   * - = null
   */
  mobile: string | null;

  headline: string | null;

  /**
   * User.ageRange
   */
  age_range: string | null;

  street_address: string | null;

  city: string | null;

  state: string | null;

  zip_code: string | null;

  occupation: string | null;

  time_zone: string | null;

  country: string | null;

  /**
   * User.jobTitle
   */
  current_job_title: string | null;

  /**
   * User.industry
   * Possible data
    Computer Games
    Food, Beverage, and Hospitality
    Entertainment
    Media & Communication
    Professional Training & Coaching
    Food & Beverages
    Others
    ????/??????
    Services
    Construction
    Media animation
    ??????????
    ????????????
    Power, Energy, and Utilities
    Pharmaceuticals & Healthcare
    Media
    Learning & Education
    Education Management
    E-Learning
    Transportation, Logistics, and Warehouse
    Pharmaceutical
    Financial
    Advertisong agency
    Property
    Wholesales, Distributor, and Retail
    Industrial
    Mining
    Human Resources
    ??????????????
    ?????????????????????????????????????
    Other
    Agriculture, Forestry, and Fishery
    Accounting
    Technology

    If not match -> set as Other
   */
  work_industry: string | null;

  /**
   * User.skillToImprove
   */
  skills_to_improve: string | null;

  member_since: string;

  /**
   * User.companyName
   */
  company_name: string | null;

  /**
   * User.department
   */
  department: string | null;

  languages_known: string | null;

  primary_language: string | null;

  marital_status: string | null;

  /**
   * Group.name / Group.children
   */
  org_name: string;

  /**
   * User.userRoles
   * split by ,
   */
  roles: string | null;

  last_visited: string | null;

  first_membership_start_date: string | null;

  last_membership_expiry_date: string | null;

  /**
   * User.gender
   * Male -> male
   * Female -> female
   * Null -> null
   */
  gender: string | null;

  /**
   * User.isActive
   * Active -> true
   * Deactive -> false
   */
  user_status: string;

  deal_id: string | null;

  /**
   * Group.name ?
   */
  group_company_name: string | null;

  invoice_number: string | null;

  invoice_company_name: string | null;

  amendment_status: string | null;
}
