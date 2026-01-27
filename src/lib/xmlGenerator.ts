import { SurveyForm, SurveyQuestion, SurveyPackage } from "@/types/survey";
import JSZip from "jszip";

function escapeXml(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  // Convert to string first - this handles 0 correctly (Number 0 -> "0")
  const str = String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateQuestionXml(question: SurveyQuestion, indent: string = '    '): string {
  const lines: string[] = [];

  // 0. Opening tag with attributes
  lines.push(`${indent}<question type='${question.type}' fieldname='${question.fieldname}' fieldtype='${question.fieldtype}'>`);

  // 1. Text
  if (question.text) {
    lines.push(`${indent}    <text>${escapeXml(question.text)}</text>`);
  }

  // 2. Calculation
  if (question.calculation) {
    const calc = question.calculation;

    if (calc.type === 'query' && calc.sql) {
      // Query type calculation with SQL
      lines.push(`${indent}    <calculation type='query'>`);
      lines.push(`${indent}        <sql>${escapeXml(calc.sql)}</sql>`);
      if (calc.params && calc.params.length > 0) {
        calc.params.forEach(p => {
          lines.push(`${indent}        <parameter name='${p.name}' field='${p.field}'/>`);
        });
      }
      lines.push(`${indent}    </calculation>`);
    } else if (calc.type === 'case' && calc.cases) {
      // Case type calculation
      lines.push(`${indent}    <calculation type='case'>`);

      calc.cases.forEach(c => {
        lines.push(`${indent}        <when field='${c.field}' operator='${escapeXml(c.operator)}' value='${c.value}'>`);
        lines.push(`${indent}            <result type='constant' value='${c.result}'/>`);
        lines.push(`${indent}        </when>`);
      });

      if (calc.elseResult) {
        lines.push(`${indent}        <else>`);
        lines.push(`${indent}            <result type='constant' value='${calc.elseResult}'/>`);
        lines.push(`${indent}        </else>`);
      }

      lines.push(`${indent}    </calculation>`);
    } else {
      // Other calculation types (age_from_date, date_diff, etc.)
      let calcTag = `${indent}    <calculation type='${calc.type}'`;

      if (calc.field) calcTag += ` field='${calc.field}'`;
      if (calc.value) calcTag += ` value='${calc.value}'`;
      if (calc.unit) calcTag += ` unit='${calc.unit}'`;
      if (calc.separator) calcTag += ` separator='${calc.separator}'`;

      calcTag += '/>';
      lines.push(calcTag);
    }
  }
  
  // 3. Max Characters
  if (question.maxCharacters !== undefined) {
    lines.push(`${indent}    <maxCharacters>${question.maxCharacters}</maxCharacters>`);
  }
  
  // 4. Mask
  if (question.mask) {
    lines.push(`${indent}    <mask value="${escapeXml(question.mask)}"/>`);
  }

  // 5. Unique Check
  if (question.uniqueCheck) {
    lines.push(`${indent}    <unique_check>`);
    lines.push(`${indent}        <message>${escapeXml(question.uniqueCheck.message)}</message>`);
    lines.push(`${indent}    </unique_check>`);
  }

  // 6. Numeric Check / Date Range
  if (question.numericCheck) {
    const nc = question.numericCheck;
    let attrs = '';
    if (nc.minValue !== undefined) attrs += ` minvalue='${nc.minValue}'`;
    if (nc.maxValue !== undefined) attrs += ` maxvalue='${nc.maxValue}'`;
    if (nc.otherValues) attrs += ` other_values='${nc.otherValues}'`;
    attrs += ` message='${escapeXml(nc.message)}'`;
    
    lines.push(`${indent}    <numeric_check>`);
    lines.push(`${indent}        <values${attrs}/>`);
    lines.push(`${indent}    </numeric_check>`);
  }
  
  if (question.dateRange) {
    lines.push(`${indent}    <date_range>`);
    if (question.dateRange.minDate) {
      lines.push(`${indent}        <min_date>${question.dateRange.minDate}</min_date>`);
    }
    if (question.dateRange.maxDate) {
      lines.push(`${indent}        <max_date>${question.dateRange.maxDate}</max_date>`);
    }
    lines.push(`${indent}    </date_range>`);
  }
  
  // 7. Responses
  if (question.responses && question.responses.length > 0) {
    lines.push(`${indent}    <responses>`);
    question.responses.forEach(resp => {
      lines.push(`${indent}        <response value='${escapeXml(resp.value)}'>${escapeXml(resp.label)}</response>`);
    });
    lines.push(`${indent}    </responses>`);
  }
  
  if (question.dynamicResponses) {
    const dr = question.dynamicResponses;
    const sourceAttr = dr.source === 'csv'
      ? `source='csv' file='${dr.file}'`
      : `source='database' table='${dr.table}'`;
    lines.push(`${indent}    <responses ${sourceAttr}>`);

    dr.filters.forEach(filter => {
      lines.push(`${indent}        <filter column='${filter.column}' operator='${filter.operator}' value='${filter.value}'/>`);
    });

    lines.push(`${indent}        <display column='${dr.displayColumn}'/>`);
    lines.push(`${indent}        <value column='${dr.valueColumn}'/>`);

    if (dr.emptyMessage) {
      lines.push(`${indent}        <empty_message>${escapeXml(dr.emptyMessage)}</empty_message>`);
    }

    if (dr.notInList) {
      lines.push(`${indent}        <not_in_list value='${dr.notInList.value}' label='${escapeXml(dr.notInList.label)}'/>`);
    }

    if (dr.dontKnow) {
      lines.push(`${indent}        <dont_know value='${dr.dontKnow.value}' label='${escapeXml(dr.dontKnow.label)}'/>`);
    }

    if (dr.distinct) {
      lines.push(`${indent}        <distinct>true</distinct>`);
    }

    lines.push(`${indent}    </responses>`);
  }
  
  // 8. Logic Check
  if (question.logicCheck && question.logicCheck.length > 0) {
    question.logicCheck.forEach(check => {
      // Format: condition; 'message'
      const content = `${escapeXml(check.condition)}; '${escapeXml(check.message)}'`;
      lines.push(`${indent}    <logic_check>`);
      lines.push(`${indent}        ${content}`);
      lines.push(`${indent}    </logic_check>`);
    });
  }
  
  // 9. Skips (Preskip / Postskip)
  if (question.preskip && question.preskip.length > 0) {
    lines.push(`${indent}    <preskip>`);
    question.preskip.forEach(skip => {
      const cond = escapeXml(skip.condition);
      const respType = skip.response_type ? ` response_type='${skip.response_type}'` : ` response_type='fixed'`; 
      
      lines.push(`${indent}        <skip fieldname='${skip.fieldname}' condition='${cond}' response='${skip.response}'${respType} skiptofieldname='${skip.skipToFieldname}'/>`);
    });
    lines.push(`${indent}    </preskip>`);
  }
  
  if (question.postskip && question.postskip.length > 0) {
    lines.push(`${indent}    <postskip>`);
    question.postskip.forEach(skip => {
      const cond = escapeXml(skip.condition);
      const respType = skip.response_type ? ` response_type='${skip.response_type}'` : ` response_type='fixed'`; 

      lines.push(`${indent}        <skip fieldname='${skip.fieldname}' condition='${cond}' response='${skip.response}'${respType} skiptofieldname='${skip.skipToFieldname}'/>`);
    });
    lines.push(`${indent}    </postskip>`);
  }
  
  // 10. Dont Know / Refuse (Not Applicable removed globally)
  if (question.dontKnow) {
    lines.push(`${indent}    <dont_know>${question.dontKnow}</dont_know>`);
  }

  if (question.refuse) {
    lines.push(`${indent}    <refuse>${question.refuse}</refuse>`);
  }

  // 11. Closing tag
  lines.push(`${indent}</question>`);
  
  return lines.join('\n');
}

export function generateFormXml(form: SurveyForm): string {
  const lines: string[] = [];
  
  lines.push(`<?xml version='1.0' encoding='utf-8'?>`);
  lines.push('<survey>');
  lines.push(''); // Blank line after <survey>
  
  // Use 4 spaces for indentation
  // Add 2 empty lines (\n\n\n) between questions for readability
  const questionsXml = form.questions.map(question => 
    generateQuestionXml(question, '    ')
  ).join('\n\n\n');

  lines.push(questionsXml);
  lines.push(''); // Blank line before </survey>
  lines.push('</survey>');
  
  return lines.join('\n');
}

export const generateManifestGistx = (pkg: SurveyPackage): string => {
  const manifest = {
    surveyName: pkg.name,
    surveyId: pkg.surveyId,
    databaseName: pkg.databaseName || `${pkg.surveyId}.sqlite`,
    xmlFiles: pkg.forms.map(f => `${f.tablename}.xml`),
    crfs: pkg.forms.map(form => {
      const isBase = !form.parenttable;

      // Base object with common fields
      const crf: Record<string, any> = {
        display_order: form.displayOrder,
        tablename: form.tablename,
        displayname: form.displayname,
        isbase: isBase ? 1 : 0,
        primarykey: form.primaryKey || (form.questions.find(q => q.fieldname === "subjid") ? "subjid" : "id"),
        linkingfield: form.linkingfield,
      };

      // Only add child form specific fields if not a base form
      if (!isBase) {
        crf.parenttable = form.parenttable;
        crf.incrementfield = form.incrementField;
        crf.requireslink = 1;
        crf.repeat_count_field = form.repeatCountField;
        crf.auto_start_repeat = form.autoStartRepeat;
        crf.repeat_enforce_count = form.repeatEnforceCount;
        crf.display_fields = form.displayFields;
        crf.entry_condition = form.entry_condition;
      }

      // ID config is used for base forms
      if (form.idconfig) {
        crf.idconfig = {
          prefix: form.idconfig.prefix,
          fields: form.idconfig.fields,
          incrementLength: form.idconfig.incrementLength
        };
      }

      return crf;
    })
  };

  return JSON.stringify(manifest, null, 2);
};

export function downloadFile(content: string, filename: string, type: string = 'text/xml') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadSurveyZip(pkg: SurveyPackage) {
  const zip = new JSZip();

  // Add manifest
  const manifestJson = generateManifestGistx(pkg);
  zip.file('survey_manifest.gistx', manifestJson);

  // Add each form as XML
  pkg.forms.forEach(form => {
    const xml = generateFormXml(form);
    zip.file(`${form.tablename}.xml`, xml);
  });

  // Add CSV files
  if (pkg.csvFiles && pkg.csvFiles.length > 0) {
    pkg.csvFiles.forEach(csvFile => {
      zip.file(csvFile.filename, csvFile.content);
    });
  }

  // Generate zip file
  const content = await zip.generateAsync({ type: "blob" });

  // Create filename using surveyId (which includes version info)
  const filename = `${pkg.surveyId || pkg.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;

  // Download logic (reusing basic anchor tag approach)
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
