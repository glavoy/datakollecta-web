import { XMLParser } from "fast-xml-parser";
import { 
  SurveyQuestion, 
  QuestionType, 
  FieldType, 
  ResponseOption, 
  DynamicResponseConfig,
  SkipRule,
  CalculationConfig
} from "@/types/survey";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseAttributeValue: true,
});

export const parseSurveyXml = (xmlContent: string): SurveyQuestion[] => {
  const jsonObj = parser.parse(xmlContent);
  const survey = jsonObj.survey;
  
  if (!survey || !survey.question) {
    return [];
  }

  // fast-xml-parser might return a single object or an array
  const questions = Array.isArray(survey.question) ? survey.question : [survey.question];

  return questions.map((q: any) => {
    const question: SurveyQuestion = {
      id: crypto.randomUUID(),
      type: q.type as QuestionType,
      fieldname: q.fieldname,
      fieldtype: q.fieldtype as FieldType,
      text: q.text || "",
    };

    if (q.maxCharacters) {
      question.maxCharacters = q.maxCharacters;
    }

    if (q.mask) {
      question.mask = q.mask.value || q.mask;
    }

    // Handle Responses
    if (q.responses) {
      if (q.responses.source === 'csv' || q.responses.source === 'database') {
        // Dynamic responses
        const dynamic: DynamicResponseConfig = {
          source: q.responses.source,
          file: q.responses.file,
          table: q.responses.table,
          displayColumn: q.responses.display?.column || "",
          valueColumn: q.responses.value?.column || "",
          filters: []
        };

        if (q.responses.filter) {
          const filters = Array.isArray(q.responses.filter) ? q.responses.filter : [q.responses.filter];
          dynamic.filters = filters.map((f: any) => ({
            column: f.column,
            operator: f.operator,
            value: f.value
          }));
        }
        
        question.dynamicResponses = dynamic;
      } else if (q.responses.response) {
        // Static responses
        const responses = Array.isArray(q.responses.response) ? q.responses.response : [q.responses.response];
        question.responses = responses.map((r: any) => ({
          id: crypto.randomUUID(),
          value: String(r.value),
          label: r["#text"] || r.label || ""
        }));
      }
    }

    // Handle Numeric Check
    if (q.numeric_check && q.numeric_check.values) {
      question.numericCheck = {
        minValue: q.numeric_check.values.minvalue,
        maxValue: q.numeric_check.values.maxvalue,
        otherValues: q.numeric_check.values.other_values,
        message: q.numeric_check.values.message
      };
    }

    // Handle Date Range
    if (q.date_range) {
      question.dateRange = {
        minDate: q.date_range.min_date,
        maxDate: q.date_range.max_date
      };
    }

    // Handle Logic Check
    if (q.logic_check) {
      // Normalize to array to handle multiple checks
      const checks = Array.isArray(q.logic_check) ? q.logic_check : [q.logic_check];
      
      // Take the first one for now (as type only supports one)
      // TODO: Update type to support multiple logic checks
      if (checks.length > 0) {
        let checkStr = checks[0];
        
        // Handle if it's an object with #text
        if (typeof checkStr === 'object' && checkStr['#text']) {
          checkStr = checkStr['#text'];
        }
        
        if (typeof checkStr === 'string') {
          const parts = checkStr.split(';');
          question.logicCheck = {
            condition: parts[0]?.trim() || "",
            message: parts[1]?.trim().replace(/^'|'$/g, "") || ""
          };
        }
      }
    }

    // Handle Unique Check
    if (q.unique_check) {
      question.uniqueCheck = {
        message: q.unique_check.message || ""
      };
    }

    // Handle Skips
    if (q.preskip && q.preskip.skip) {
      const skips = Array.isArray(q.preskip.skip) ? q.preskip.skip : [q.preskip.skip];
      question.preskip = skips.map(mapSkipRule);
    }

    if (q.postskip && q.postskip.skip) {
      const skips = Array.isArray(q.postskip.skip) ? q.postskip.skip : [q.postskip.skip];
      question.postskip = skips.map(mapSkipRule);
    }

    // Handle Calculation
    if (q.calculation) {
      const calc: CalculationConfig = {
        type: q.calculation.type,
        field: q.calculation.field,
        value: q.calculation.value,
        unit: q.calculation.unit,
      };

      if (q.calculation.when) {
        const whens = Array.isArray(q.calculation.when) ? q.calculation.when : [q.calculation.when];
        calc.cases = whens.map((w: any) => ({
          field: w.field,
          operator: w.operator,
          value: w.value,
          result: w.result?.value || w.result?.constant || ""
        }));
      }

      if (q.calculation.else) {
        calc.elseResult = q.calculation.else.result?.value || q.calculation.else.result?.constant || "";
      }

      question.calculation = calc;
    }

    return question;
  });
};

const mapSkipRule = (s: any): SkipRule => ({
  id: crypto.randomUUID(),
  fieldname: s.fieldname,
  condition: s.condition,
  response: String(s.response),
  skipToFieldname: s.skiptofieldname
});
