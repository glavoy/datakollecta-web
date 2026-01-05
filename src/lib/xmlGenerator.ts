import { SurveyForm, SurveyQuestion, SurveyPackage } from "@/types/survey";
import JSZip from "jszip";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateQuestionXml(question: SurveyQuestion, indent: string = '    '): string {
  const lines: string[] = [];
  
  // Opening tag with attributes
  lines.push(`${indent}<question type='${question.type}' fieldname='${question.fieldname}' fieldtype='${question.fieldtype}'>`);
  
  // Text
  if (question.text) {
    lines.push(`${indent}    <text>${escapeXml(question.text)}</text>`);
  }
  
  // Max Characters
  if (question.maxCharacters !== undefined) {
    lines.push(`${indent}    <maxCharacters>${question.maxCharacters}</maxCharacters>`);
  }
  
  // Mask
  if (question.mask) {
    lines.push(`${indent}    <mask value="${escapeXml(question.mask)}" />`);
  }
  
  // Static Responses
  if (question.responses && question.responses.length > 0) {
    lines.push(`${indent}    <responses>`);
    question.responses.forEach(resp => {
      lines.push(`${indent}        <response value='${escapeXml(resp.value)}'>${escapeXml(resp.label)}</response>`);
    });
    lines.push(`${indent}    </responses>`);
  }
  
  // Dynamic Responses
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
    
    if (dr.distinct) {
      lines.push(`${indent}        <distinct>true</distinct>`);
    }
    
    lines.push(`${indent}    </responses>`);
  }
  
  // Numeric Check
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
  
  // Date Range
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
  
  // Logic Check
  if (question.logicCheck) {
    // Format: condition; 'message'
    const content = `${escapeXml(question.logicCheck.condition)}; '${escapeXml(question.logicCheck.message)}'`;
    lines.push(`${indent}    <logic_check>`);
    lines.push(`${indent}        ${content}`);
    lines.push(`${indent}    </logic_check>`);
  }
  
  // Unique Check
  if (question.uniqueCheck) {
    lines.push(`${indent}    <unique_check>`);
    lines.push(`${indent}        <message>${escapeXml(question.uniqueCheck.message)}</message>`);
    lines.push(`${indent}    </unique_check>`);
  }
  
  // Pre-skip
  if (question.preskip && question.preskip.length > 0) {
    lines.push(`${indent}    <preskip>`);
    question.preskip.forEach(skip => {
      const cond = escapeXml(skip.condition);
      lines.push(`${indent}        <skip fieldname='${skip.fieldname}' condition='${cond}' response='${skip.response}' skiptofieldname='${skip.skipToFieldname}'/>`);
    });
    lines.push(`${indent}    </preskip>`);
  }
  
  // Post-skip
  if (question.postskip && question.postskip.length > 0) {
    lines.push(`${indent}    <postskip>`);
    question.postskip.forEach(skip => {
      const cond = escapeXml(skip.condition);
      lines.push(`${indent}        <skip fieldname='${skip.fieldname}' condition='${cond}' response='${skip.response}' skiptofieldname='${skip.skipToFieldname}'/>`);
    });
    lines.push(`${indent}    </postskip>`);
  }
  
  // Calculation
  if (question.calculation) {
    const calc = question.calculation;
    let calcTag = `${indent}    <calculation type='${calc.type}'`;
    
    if (calc.field) calcTag += ` field='${calc.field}'`;
    if (calc.value) calcTag += ` value='${calc.value}'`;
    if (calc.unit) calcTag += ` unit='${calc.unit}'`;
    
    if (calc.type === 'case' && calc.cases) {
      calcTag += '>';
      lines.push(calcTag);
      
      calc.cases.forEach(c => {
        lines.push(`${indent}        <when field='${c.field}' operator='${escapeXml(c.operator)}' value='${c.value}'>`);
        lines.push(`${indent}            <result type='constant' value='${c.result}' />`);
        lines.push(`${indent}        </when>`);
      });
      
      if (calc.elseResult) {
        lines.push(`${indent}        <else>`);
        lines.push(`${indent}            <result type='constant' value='${calc.elseResult}' />`);
        lines.push(`${indent}        </else>`);
      }
      
      lines.push(`${indent}    </calculation>`);
    } else {
      calcTag += '/>';
      lines.push(calcTag);
    }
  }
  
  // Don't Know
  if (question.dontKnow) {
    lines.push(`${indent}    <dont_know>${question.dontKnow}</dont_know>`);
  }
  
  // Refuse
  if (question.refuse) {
    lines.push(`${indent}    <refuse>${question.refuse}</refuse>`);
  }
  
  lines.push(`${indent}</question>`);
  
  return lines.join('\n');
}

export function generateFormXml(form: SurveyForm): string {
  const lines: string[] = [];
  
  lines.push(`<?xml version='1.0' encoding='utf-8'?>`);
  lines.push('<survey>');
  
  form.questions.forEach(question => {
    lines.push(generateQuestionXml(question));
  });
  
  lines.push('</survey>');
  
  return lines.join('\n');
}

export function generateManifestGistx(pkg: SurveyPackage): string {
  const sanitizedId = pkg.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  const manifest = {
    surveyName: pkg.name,
    surveyId: sanitizedId,
    databaseName: `${sanitizedId}.sqlite`,
    xmlFiles: pkg.forms.map(f => `${f.tablename}.xml`),
    crfs: pkg.forms.map(form => ({
      display_order: form.displayOrder,
      tablename: form.tablename,
      displayname: form.displayname,
      isbase: 1, 
      primarykey: form.questions.find(q => q.id === "subjid") ? "subjid" : "id",
      linkingfield: form.linkingfield || "subjid",
      idconfig: form.idconfig || null,
      display_fields: form.displayFields || null
    }))
  };
  
  return JSON.stringify(manifest, null, 2);
}

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
  
  // Generate zip file
  const content = await zip.generateAsync({ type: "blob" });
  
  // Create filename: project_name_yyyy-mm-dd.zip
  const date = new Date().toISOString().split('T')[0];
  const sanitizedProjectName = pkg.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${sanitizedProjectName}_${date}.zip`;
  
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
