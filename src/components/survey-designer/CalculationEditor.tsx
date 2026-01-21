import { CalculationConfig, SurveyQuestion } from "@/types/survey";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CalculationEditorProps {
  calculation: CalculationConfig | undefined;
  availableFields: SurveyQuestion[];
  onChange: (calc: CalculationConfig | undefined) => void;
}

const CalculationEditor = ({ calculation, availableFields, onChange }: CalculationEditorProps) => {
  const dateFields = availableFields.filter(q =>
    q.fieldtype === 'date' || q.fieldtype === 'datetime'
  );

  const handleTypeChange = (type: CalculationConfig['type']) => {
    onChange({ type });
  };

  const addCase = () => {
    if (!calculation) return;
    const cases = calculation.cases || [];
    onChange({
      ...calculation,
      cases: [...cases, { field: '', operator: '=', value: '', result: '' }]
    });
  };

  const updateCase = (index: number, field: string, value: string) => {
    if (!calculation?.cases) return;
    const newCases = [...calculation.cases];
    newCases[index] = { ...newCases[index], [field]: value };
    onChange({ ...calculation, cases: newCases });
  };

  const removeCase = (index: number) => {
    if (!calculation?.cases) return;
    onChange({
      ...calculation,
      cases: calculation.cases.filter((_, i) => i !== index)
    });
  };

  // Query params helpers
  const addQueryParam = () => {
    if (!calculation) return;
    const params = calculation.params || [];
    onChange({
      ...calculation,
      params: [...params, { name: '', field: '' }]
    });
  };

  const updateQueryParam = (index: number, key: 'name' | 'field', value: string) => {
    if (!calculation?.params) return;
    const newParams = [...calculation.params];
    newParams[index] = { ...newParams[index], [key]: value };
    onChange({ ...calculation, params: newParams });
  };

  const removeQueryParam = (index: number) => {
    if (!calculation?.params) return;
    onChange({
      ...calculation,
      params: calculation.params.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Calculation Type</Label>
        <Select
          value={calculation?.type || ''}
          onValueChange={(v) => handleTypeChange(v as CalculationConfig['type'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select calculation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="age_from_date">Age from Date (today)</SelectItem>
            <SelectItem value="age_at_date">Age at Specific Date</SelectItem>
            <SelectItem value="date_diff">Date Difference</SelectItem>
            <SelectItem value="date_offset">Date Offset</SelectItem>
            <SelectItem value="case">Conditional (If/Else)</SelectItem>
            <SelectItem value="concat">Concatenate</SelectItem>
            <SelectItem value="math">Math Expression</SelectItem>
            <SelectItem value="constant">Constant Value</SelectItem>
            <SelectItem value="lookup">Lookup (Copy from Field)</SelectItem>
            <SelectItem value="query">SQL Query</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Age from Date - calculate age from a date field to today */}
      {calculation?.type === 'age_from_date' && (
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="space-y-2">
            <Label>Date of Birth Field</Label>
            <Select
              value={calculation.field || ''}
              onValueChange={(v) => onChange({ ...calculation, field: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date field" />
              </SelectTrigger>
              <SelectContent>
                {dateFields.map(q => (
                  <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Result Unit</Label>
            <Select
              value={calculation.unit || 'y'}
              onValueChange={(v) => onChange({ ...calculation, unit: v as 'y' | 'm' | 'w' | 'd' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="y">Years</SelectItem>
                <SelectItem value="m">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Age at Date - calculate age at a specific date */}
      {calculation?.type === 'age_at_date' && (
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date of Birth Field</Label>
              <Select
                value={calculation.field || ''}
                onValueChange={(v) => onChange({ ...calculation, field: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {dateFields.map(q => (
                    <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference Date Field</Label>
              <Select
                value={calculation.value || ''}
                onValueChange={(v) => onChange({ ...calculation, value: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {dateFields.map(q => (
                    <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Result Unit</Label>
            <Select
              value={calculation.unit || 'y'}
              onValueChange={(v) => onChange({ ...calculation, unit: v as 'y' | 'm' | 'w' | 'd' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="y">Years</SelectItem>
                <SelectItem value="m">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Date Difference */}
      {calculation?.type === 'date_diff' && (
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date Field</Label>
              <Select
                value={calculation.field || ''}
                onValueChange={(v) => onChange({ ...calculation, field: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {dateFields.map(q => (
                    <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Date Field</Label>
              <Select
                value={calculation.value || ''}
                onValueChange={(v) => onChange({ ...calculation, value: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {dateFields.map(q => (
                    <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Result Unit</Label>
            <Select
              value={calculation.unit || 'd'}
              onValueChange={(v) => onChange({ ...calculation, unit: v as 'y' | 'm' | 'w' | 'd' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="y">Years</SelectItem>
                <SelectItem value="m">Months</SelectItem>
                <SelectItem value="w">Weeks</SelectItem>
                <SelectItem value="d">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Date Offset - add/subtract from a date */}
      {calculation?.type === 'date_offset' && (
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="space-y-2">
            <Label>Source Date Field</Label>
            <Select
              value={calculation.field || ''}
              onValueChange={(v) => onChange({ ...calculation, field: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date field" />
              </SelectTrigger>
              <SelectContent>
                {dateFields.map(q => (
                  <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Offset Value</Label>
            <Input
              value={calculation.value || ''}
              onChange={(e) => onChange({ ...calculation, value: e.target.value })}
              placeholder="e.g., +7d, -1m, +1y (or field name)"
            />
            <p className="text-xs text-muted-foreground">
              Use +/- with d (days), w (weeks), m (months), y (years). Or a field name.
            </p>
          </div>
        </div>
      )}

      {/* Constant */}
      {calculation?.type === 'constant' && (
        <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
          <Label>Constant Value</Label>
          <Input
            value={calculation.value || ''}
            onChange={(e) => onChange({ ...calculation, value: e.target.value })}
            placeholder="Enter constant value"
          />
        </div>
      )}

      {/* Lookup - copy from another field */}
      {calculation?.type === 'lookup' && (
        <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
          <Label>Source Field</Label>
          <Select
            value={calculation.field || ''}
            onValueChange={(v) => onChange({ ...calculation, field: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field to copy from" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map(q => (
                <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Value will be copied from the selected field
          </p>
        </div>
      )}

      {/* Conditional (Case) */}
      {calculation?.type === 'case' && (
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center justify-between">
            <Label>Conditions</Label>
            <Button variant="outline" size="sm" onClick={addCase}>
              <Plus className="h-4 w-4 mr-1" />
              Add Condition
            </Button>
          </div>

          <div className="space-y-2">
            {calculation.cases?.map((c, index) => (
              <div key={index} className="p-3 border border-border rounded-lg bg-background space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">When</span>
                  <Select
                    value={c.field}
                    onValueChange={(v) => updateCase(index, 'field', v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map(q => (
                        <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={c.operator}
                    onValueChange={(v) => updateCase(index, 'operator', v)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value="<>">!=</SelectItem>
                      <SelectItem value="<">&lt;</SelectItem>
                      <SelectItem value=">">&gt;</SelectItem>
                      <SelectItem value="<=">&lt;=</SelectItem>
                      <SelectItem value=">=">&gt;=</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Value"
                    value={c.value}
                    onChange={(e) => updateCase(index, 'value', e.target.value)}
                    className="w-24"
                  />

                  <span className="text-sm">then</span>

                  <Input
                    placeholder="Result"
                    value={c.result}
                    onChange={(e) => updateCase(index, 'result', e.target.value)}
                    className="w-24"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCase(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Else (default) Result</Label>
            <Input
              value={calculation.elseResult || ''}
              onChange={(e) => onChange({ ...calculation, elseResult: e.target.value })}
              placeholder="Default value if no conditions match"
            />
          </div>
        </div>
      )}

      {/* Math Expression */}
      {calculation?.type === 'math' && (
        <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
          <Label>Math Expression</Label>
          <Input
            value={calculation.value || ''}
            onChange={(e) => onChange({ ...calculation, value: e.target.value })}
            placeholder="e.g., field1 + field2 * 2"
          />
          <p className="text-xs text-muted-foreground">
            Use field names and operators: +, -, *, /, (). Parentheses for grouping.
          </p>
        </div>
      )}

      {/* Concatenate */}
      {calculation?.type === 'concat' && (
        <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
          <Label>Fields to Concatenate</Label>
          <Input
            value={calculation.value || ''}
            onChange={(e) => onChange({ ...calculation, value: e.target.value })}
            placeholder="field1, field2, field3"
          />
          <div className="space-y-2 mt-3">
            <Label className="text-sm">Separator (optional)</Label>
            <Input
              value={calculation.separator || ''}
              onChange={(e) => onChange({ ...calculation, separator: e.target.value })}
              placeholder="e.g., - or space"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Comma-separated list of field names. Use quotes for literal text: "prefix", field1
          </p>
        </div>
      )}

      {/* SQL Query */}
      {calculation?.type === 'query' && (
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="space-y-2">
            <Label>SQL Query</Label>
            <Textarea
              value={calculation.sql || ''}
              onChange={(e) => onChange({ ...calculation, sql: e.target.value })}
              placeholder="SELECT column FROM table WHERE id = :param1"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Use :paramName for parameters that will be populated from fields
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Query Parameters</Label>
              <Button variant="outline" size="sm" onClick={addQueryParam}>
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>

            {(calculation.params || []).map((param, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Param name (e.g., param1)"
                  value={param.name}
                  onChange={(e) => updateQueryParam(index, 'name', e.target.value)}
                  className="w-36"
                />
                <span className="text-sm">=</span>
                <Select
                  value={param.field}
                  onValueChange={(v) => updateQueryParam(index, 'field', v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(q => (
                      <SelectItem key={q.id} value={q.fieldname}>{q.fieldname}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQueryParam(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {(!calculation.params || calculation.params.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No parameters configured.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationEditor;
