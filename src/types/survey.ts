export type QuestionType =
  | 'text'
  | 'radio'
  | 'checkbox'
  | 'combobox'
  | 'date'
  | 'datetime'
  | 'information'
  | 'calculated'
  | 'button';

export type FieldType =
  | 'text'
  | 'integer'
  | 'text_integer'
  | 'text_decimal'
  | 'text_id'
  | 'phone_num'
  | 'hourmin'
  | 'date'
  | 'datetime'
  | 'n/a';

export type SkipCondition = '=' | '<>' | '<' | '>' | '>=' | '<=' | 'contains' | 'does not contain';

export type CalculationType =
  | 'age_from_date'
  | 'age_at_date'
  | 'date_diff'
  | 'date_offset'
  | 'case'
  | 'concat'
  | 'math'
  | 'constant'
  | 'lookup'
  | 'query';

export interface ResponseOption {
  id: string;
  value: string;
  label: string;
}

export interface DynamicResponseConfig {
  source: 'csv' | 'database';
  file?: string;
  table?: string;
  displayColumn: string;
  valueColumn: string;
  filters: Array<{
    column: string;
    operator: string;
    value: string;
  }>;
  distinct?: boolean;
  emptyMessage?: string;
  dontKnow?: { value: string; label: string };
  notInList?: { value: string; label: string };
}

export interface NumericCheck {
  minValue?: number;
  maxValue?: number;
  otherValues?: string;
  message: string;
}

export interface DateRange {
  minDate?: string;
  maxDate?: string;
  // Ensure the parser handles "0" as string if needed, string type is correct here
}

export interface LogicCheck {
  condition: string; // e.g., "age > 18"
  message: string;
}

export interface SkipRule {
  id: string;
  fieldname: string;
  condition: SkipCondition;
  response: string;
  response_type?: 'fixed' | 'dynamic';
  skipToFieldname: string;
}

export interface CalculationConfig {
  type: CalculationType;
  field?: string;
  value?: string;
  unit?: 'y' | 'm' | 'w' | 'd';
  separator?: string;
  cases?: Array<{
    field: string;
    operator: string;
    value: string;
    result: string;
  }>;
  elseResult?: string;
  // For query type
  sql?: string;
  params?: Array<{ name: string; field: string }>;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  fieldname: string;
  fieldtype: FieldType;
  text: string;
  maxCharacters?: number | string; // Can be string in XML if parsed that way
  mask?: string;
  responses?: ResponseOption[];
  dynamicResponses?: DynamicResponseConfig;
  numericCheck?: NumericCheck;
  dateRange?: DateRange;
  logicCheck?: LogicCheck[];
  uniqueCheck?: { message: string };
  preskip?: SkipRule[];
  postskip?: SkipRule[];
  calculation?: CalculationConfig;
  dontKnow?: string;
  refuse?: string;
  na?: string;
}

// Manifest (CRFS) Types
export type AutoStartRepeat = 0 | 1 | 2;
export type RepeatEnforceCount = 0 | 1 | 2 | 3;

export interface IdConfigField {
  name: string;
  length: number;
}

export interface IdConfig {
  prefix: string;
  fields: IdConfigField[];
  incrementLength: number;
}

export interface SurveyForm {
  id: string;
  tablename: string;
  displayname: string;
  displayOrder: number;
  parenttable?: string;
  linkingfield?: string;
  displayFields?: string;
  
  // New/Updated fields
  idconfig?: IdConfig;
  repeatCountField?: string;
  repeatCountSource?: string; // UI helper, likely not in manifest
  autoStartRepeat: AutoStartRepeat;
  repeatEnforceCount: RepeatEnforceCount;
  
  primaryKey?: string;
  incrementField?: string;
  entry_condition?: string;
  
  questions: SurveyQuestion[];
}

export interface SurveyPackage {
  id: string; // Database UUID
  surveyId: string; // Logical ID (e.g. prism_css_v1), maps to survey_packages.name
  name: string; // Display Name, maps to survey_packages.display_name
  version: string;
  forms: SurveyForm[];
  
  // Global Manifest settings
  databaseName?: string;
  xmlFiles?: string[];
}
