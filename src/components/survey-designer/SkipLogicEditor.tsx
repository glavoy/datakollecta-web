import { SkipRule, SurveyQuestion } from "@/types/survey";
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
        <Label>{type === 'preskip' ? 'Pre-Skip Logic' : 'Post-Skip Logic'}</Label>
        <Button variant="outline" size="sm" onClick={addRule}>
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {type === 'preskip' 
          ? 'Skip this question if a condition is met (evaluated before showing)' 
          : 'Jump to another question after answering (evaluated after response)'}
      </p>
      
      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="p-3 border border-border rounded-lg space-y-2 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm">If</span>
              <Select
                value={rule.fieldname}
                onValueChange={(v) => updateRule(rule.id, 'fieldname', v)}
              >
                <SelectTrigger className="w-40">
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
                onValueChange={(v) => updateRule(rule.id, 'condition', v as SkipRule['condition'])}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="=">=</SelectItem>
                  <SelectItem value="<>">≠</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value=">">&gt;</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Value"
                value={rule.response}
                onChange={(e) => updateRule(rule.id, 'response', e.target.value)}
                className="w-24"
              />
              
              <span className="text-sm">skip to</span>
              
              <Select
                value={rule.skipToFieldname}
                onValueChange={(v) => updateRule(rule.id, 'skipToFieldname', v)}
              >
                <SelectTrigger className="w-40">
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
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeRule(rule.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No skip rules configured.
          </p>
        )}
      </div>
    </div>
  );
};

export default SkipLogicEditor;
