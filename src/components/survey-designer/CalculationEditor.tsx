import { CalculationConfig, SurveyQuestion } from "@/types/survey";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

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
            <SelectItem value="age_from_date">Age from Date</SelectItem>
            <SelectItem value="age_at_date">Age at Specific Date</SelectItem>
            <SelectItem value="date_diff">Date Difference</SelectItem>
            <SelectItem value="case">Conditional (If/Else)</SelectItem>
            <SelectItem value="concat">Concatenate</SelectItem>
            <SelectItem value="math">Math Expression</SelectItem>
            <SelectItem value="constant">Constant Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {calculation?.type === 'age_from_date' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Date Field</Label>
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
              value={calculation.value || 'years'}
              onValueChange={(v) => onChange({ ...calculation, value: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="years">Years</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {calculation?.type === 'date_diff' && (
        <div className="space-y-3">
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

      {calculation?.type === 'constant' && (
        <div className="space-y-2">
          <Label>Constant Value</Label>
          <Input
            value={calculation.value || ''}
            onChange={(e) => onChange({ ...calculation, value: e.target.value })}
            placeholder="Enter constant value"
          />
        </div>
      )}

      {calculation?.type === 'case' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Conditions</Label>
            <Button variant="outline" size="sm" onClick={addCase}>
              <Plus className="h-4 w-4 mr-1" />
              Add Condition
            </Button>
          </div>
          
          <div className="space-y-2">
            {calculation.cases?.map((c, index) => (
              <div key={index} className="p-3 border border-border rounded-lg bg-muted/30 space-y-2">
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
                      <SelectItem value="<>">≠</SelectItem>
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

      {calculation?.type === 'math' && (
        <div className="space-y-2">
          <Label>Math Expression</Label>
          <Input
            value={calculation.value || ''}
            onChange={(e) => onChange({ ...calculation, value: e.target.value })}
            placeholder="e.g., field1 + field2 * 2"
          />
          <p className="text-xs text-muted-foreground">
            Use field names and operators: +, -, *, /
          </p>
        </div>
      )}

      {calculation?.type === 'concat' && (
        <div className="space-y-2">
          <Label>Fields to Concatenate</Label>
          <Input
            value={calculation.value || ''}
            onChange={(e) => onChange({ ...calculation, value: e.target.value })}
            placeholder="field1, field2, field3"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of field names
          </p>
        </div>
      )}
    </div>
  );
};

export default CalculationEditor;
