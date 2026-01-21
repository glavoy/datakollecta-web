import { SkipRule, SurveyQuestion, SkipCondition } from "@/types/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface SkipLogicEditorProps {
  type: 'preskip' | 'postskip';
  rules: SkipRule[];
  availableFields: SurveyQuestion[];
  onChange: (rules: SkipRule[]) => void;
}

// All available skip conditions
const skipConditions: { value: SkipCondition; label: string }[] = [
  { value: '=', label: '=' },
  { value: '<>', label: '!=' },
  { value: '<', label: '<' },
  { value: '>', label: '>' },
  { value: '<=', label: '<=' },
  { value: '>=', label: '>=' },
  { value: 'contains', label: 'contains' },
  { value: 'does not contain', label: 'not contains' },
];

const SkipLogicEditor = ({ type, rules, availableFields, onChange }: SkipLogicEditorProps) => {
  const addRule = () => {
    onChange([
      ...rules,
      {
        id: crypto.randomUUID(),
        fieldname: '',
        condition: '=',
        response: '',
        skipToFieldname: ''
      }
    ]);
  };

  const updateRule = (id: string, field: keyof SkipRule, value: string) => {
    onChange(
      rules.map(r =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
  };

  const removeRule = (id: string) => {
    onChange(rules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label>{type === 'preskip' ? 'Pre-Skip Logic' : 'Post-Skip Logic'}</Label>
          <p className="text-xs text-muted-foreground mt-1">
            {type === 'preskip'
              ? 'Skip this question if a condition is met (evaluated before showing)'
              : 'Jump to another question after answering (evaluated after response)'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addRule}>
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="p-4 border border-border rounded-lg space-y-3 bg-muted/30">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">If</span>
              <Select
                value={rule.fieldname}
                onValueChange={(v) => updateRule(rule.id, 'fieldname', v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(q => (
                    <SelectItem key={q.id} value={q.fieldname}>
                      {q.fieldname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={rule.condition}
                onValueChange={(v) => updateRule(rule.id, 'condition', v as SkipCondition)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skipConditions.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Value"
                value={rule.response}
                onChange={(e) => updateRule(rule.id, 'response', e.target.value)}
                className="w-28"
              />

              <span className="text-sm font-medium">then skip to</span>

              <Select
                value={rule.skipToFieldname}
                onValueChange={(v) => updateRule(rule.id, 'skipToFieldname', v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end">End of Form</SelectItem>
                  {availableFields.map(q => (
                    <SelectItem key={q.id} value={q.fieldname}>
                      {q.fieldname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRule(rule.id)}
                className="text-destructive hover:text-destructive ml-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Response type selector for dynamic values */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Value type:</span>
              <Select
                value={rule.response_type || 'fixed'}
                onValueChange={(v) => updateRule(rule.id, 'response_type', v as 'fixed' | 'dynamic')}
              >
                <SelectTrigger className="h-7 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed value</SelectItem>
                  <SelectItem value="dynamic">From field</SelectItem>
                </SelectContent>
              </Select>
              {rule.response_type === 'dynamic' && (
                <span className="text-muted-foreground">
                  (use field name as value, e.g., "other_field")
                </span>
              )}
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
            No skip rules configured. Click "Add Rule" to create one.
          </p>
        )}
      </div>
    </div>
  );
};

export default SkipLogicEditor;
