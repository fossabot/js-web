export interface Policy {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  isSystemDefined: boolean;
  policies?: Policy[];
}
