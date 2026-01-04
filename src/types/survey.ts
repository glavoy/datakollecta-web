// Survey Question Types
export type QuestionType = 
  | 'text' 
  | 'radio' 
  | 'checkbox' 
  | 'combobox' 
  | 'date' 
  | 'datetime' 
  | 'information' 
  | 'automatic';

export type FieldType = 
  | 'text' 
  | 'integer' 
  | 'text_integer' 
  | 'date' 
  | 'datetime' 
  | 'n/a';

export type SkipCondition = '=' | '<>' | '<' | '>';

export type CalculationType = 
  | 'age_from_date' 
  | 'age_at_date' 
  | 'date_diff' 
  | 'case' 
  | 'concat' 
  | 'math' 
  | 'constant';

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
}

export interface LogicCheck {
  condition: string;
  message: string;
}

export interface SkipRule {
  id: string;
  fieldname: string;
  condition: SkipCondition;
  response: string;
  skipToFieldname: string;
}

export interface CalculationConfig {
  type: CalculationType;
  field?: string;
  value?: string;
  unit?: 'y' | 'm' | 'w' | 'd';
  cases?: Array<{
    field: string;
    operator: string;
    value: string;
    result: string;
  }>;
  elseResult?: string;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  fieldname: string;
  fieldtype: FieldType;
  text: string;
  maxCharacters?: number | string;
  mask?: string;
  responses?: ResponseOption[];
  dynamicResponses?: DynamicResponseConfig;
  numericCheck?: NumericCheck;
  dateRange?: DateRange;
  logicCheck?: LogicCheck;
  uniqueCheck?: { message: string };
  preskip?: SkipRule[];
  postskip?: SkipRule[];
  calculation?: CalculationConfig;
  dontKnow?: string;
  refuse?: string;
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
  idconfig?: IdConfig;
  repeatCountField?: string;
  repeatCountSource?: string;
  autoStartRepeat: AutoStartRepeat;
  repeatEnforceCount: RepeatEnforceCount;
  questions: SurveyQuestion[];
}

/**
 * Represents the survey configuration for a Project.
 * In the new flattened structure, the 'SurveyPackage' is essentially the Project's protocol.
 */
export interface ProjectProtocol {
  id: string; // This is the Project ID
  name: string; // Project Name
  version: string;
  forms: SurveyForm[];
}

// Alias for backward compatibility if needed during refactor, 
// but code should prefer ProjectProtocol
export type SurveyPackage = ProjectProtocol;
