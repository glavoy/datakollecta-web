import { ResponseOption } from "@/types/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface ResponseOptionsEditorProps {
  responses: ResponseOption[];
  onChange: (responses: ResponseOption[]) => void;
}

const ResponseOptionsEditor = ({ responses, onChange }: ResponseOptionsEditorProps) => {
  const addResponse = () => {
    onChange([
      ...responses,
      { id: crypto.randomUUID(), value: String(responses.length + 1), label: '' }
    ]);
  };

  const updateResponse = (id: string, field: 'value' | 'label', newValue: string) => {
    onChange(
      responses.map(r => 
        r.id === id ? { ...r, [field]: newValue } : r
      )
    );
  };

  const removeResponse = (id: string) => {
    onChange(responses.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Response Options</Label>
        <Button variant="outline" size="sm" onClick={addResponse}>
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>
      
      <div className="space-y-2">
        {responses.map((response, index) => (
          <div key={response.id} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
            <Input
              placeholder="Value (stored)"
              value={response.value}
              onChange={(e) => updateResponse(response.id, 'value', e.target.value)}
              className="w-24"
            />
            <Input
              placeholder="Label (displayed)"
              value={response.label}
              onChange={(e) => updateResponse(response.id, 'label', e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removeResponse(response.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {responses.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No response options. Click "Add Option" to create choices.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResponseOptionsEditor;
