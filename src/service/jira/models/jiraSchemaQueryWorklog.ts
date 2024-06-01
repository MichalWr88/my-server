export  interface JiraWorklogListResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: Issue[];
}


export interface Issue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: Fields;
}

export interface Fields {
  summary: string;
  issuetype: Issuetype;
  parent: Parent;
  components: Component[];
  customfield_11902: Customfield11902;
  description: string;
  customfield_13200: string;
  worklog: WorklogObj;
  labels: string[];
}

export interface Issuetype {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
}

export interface Parent {
  id: string;
  key: string;
  self: string;
  fields: Fields2;
}

export interface Fields2 {
  summary: string;
  status: Status;
  priority: Priority;
  issuetype: Issuetype2;
}

export interface Status {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: StatusCategory;
}

export interface StatusCategory {
  self: string;
  id: number;
  key: string;
  colorName: string;
  name: string;
}

export interface Priority {
  self: string;
  iconUrl: string;
  name: string;
  id: string;
}

export interface Issuetype2 {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
}

export interface Component {
  self: string;
  id: string;
  name: string;
  description?: string;
}

export interface Customfield11902 {
  self: string;
  value: string;
  id: string;
  disabled: boolean;
}

export interface WorklogObj {
  startAt: number;
  maxResults: number;
  total: number;
  worklogs: Worklog[];
}

export interface Worklog {
  self: string;
  author: Author;
  updateAuthor: UpdateAuthor;
  comment: string;
  created: string;
  updated: string;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  id: string;
  issueId: string;
}

export interface Author {
  self: string;
  name: string;
  key: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
  timeZone: string;
}

export interface UpdateAuthor {
  self: string;
  name: string;
  key: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
  timeZone: string;
}
