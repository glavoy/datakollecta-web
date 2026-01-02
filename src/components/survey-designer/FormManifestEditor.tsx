import { SurveyForm, IdConfig } from "@/types/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";

interface FormManifestEditorProps {
  form: SurveyForm;
  allForms: SurveyForm[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: SurveyForm) => void;
}

const FormManifestEditor = ({ form, allForms, open, onOpenChange, onSave }: FormManifestEditorProps) => {
  const [editedForm, setEditedForm] = useState<SurveyForm>({ ...form });

  // Reset when opening with a new form
  if (form.id !== editedForm.id) {
    setEditedForm({ ...form });
  }

  const update = <K extends keyof SurveyForm>(field: K, value: SurveyForm[K]) => {
    setEditedForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedForm);
    onOpenChange(false);
  };

  const updateIdConfig = (updates: Partial<IdConfig>) => {
    const current = editedForm.idconfig || { prefix: '', fields: [], incrementLength: 3 };
    update('idconfig', { ...current, ...updates });
  };

  const addIdField = () => {
    const current = editedForm.idconfig || { prefix: '', fields: [], incrementLength: 3 };
    updateIdConfig({
      fields: [...current.fields, { name: '', length: 2 }]
    });
  };

  const updateIdField = (index: number, field: 'name' | 'length', value: string | number) => {
    if (!editedForm.idconfig) return;
    const newFields = [...editedForm.idconfig.fields];
    newFields[index] = { ...newFields[index], [field]: value };
    updateIdConfig({ fields: newFields });
  };

  const removeIdField = (index: number) => {
    if (!editedForm.idconfig) return;
    updateIdConfig({
      fields: editedForm.idconfig.fields.filter((_, i) => i !== index)
    });
  };

  const otherForms = allForms.filter(f => f.id !== form.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Form Configuration</SheetTitle>
          <SheetDescription>
            Configure form manifest settings for the mobile app
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Accordion type="multiple" defaultValue={["basic", "hierarchy"]} className="w-full">
            {/* Basic Settings */}
            <AccordionItem value="basic">
              <AccordionTrigger>Basic Identification</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Table Name</Label>
                  <Input
                    value={editedForm.tablename}
                    onChange={(e) => update('tablename', e.target.value.replace(/\s/g, '_').toLowerCase())}
                    placeholder="e.g., enrollment"
                  />
                  <p className="text-xs text-muted-foreground">
                    Matches the XML filename (without extension)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={editedForm.displayname}
                    onChange={(e) => update('displayname', e.target.value)}
                    placeholder="e.g., Enrollment Form"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={editedForm.displayOrder}
                    onChange={(e) => update('displayOrder', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Display Fields (for list view)</Label>
                  <Input
                    value={editedForm.displayFields || ''}
                    onChange={(e) => update('displayFields', e.target.value || undefined)}
                    placeholder="e.g., subjid, name, age"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated field names shown in record list
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Hierarchy */}
            <AccordionItem value="hierarchy">
              <AccordionTrigger>Hierarchy & Navigation</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Parent Table</Label>
                  <Select
                    value={editedForm.parenttable || '_none_'}
                    onValueChange={(v) => update('parenttable', v === '_none_' ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (top-level form)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">None (top-level form)</SelectItem>
                      {otherForms.map(f => (
                        <SelectItem key={f.id} value={f.tablename}>
                          {f.displayname} ({f.tablename})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {editedForm.parenttable && (
                  <div className="space-y-2">
                    <Label>Linking Field</Label>
                    <Input
                      value={editedForm.linkingfield || ''}
                      onChange={(e) => update('linkingfield', e.target.value || undefined)}
                      placeholder="e.g., hhid"
                    />
                    <p className="text-xs text-muted-foreground">
                      Field used to link child records to parent
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* ID Configuration */}
            <AccordionItem value="idconfig">
              <AccordionTrigger>ID Generation</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="enableIdConfig"
                    checked={!!editedForm.idconfig}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        update('idconfig', { prefix: '', fields: [], incrementLength: 3 });
                      } else {
                        update('idconfig', undefined);
                      }
                    }}
                  />
                  <Label htmlFor="enableIdConfig">Enable automatic ID generation</Label>
                </div>

                {editedForm.idconfig && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label>ID Prefix</Label>
                      <Input
                        value={editedForm.idconfig.prefix}
                        onChange={(e) => updateIdConfig({ prefix: e.target.value })}
                        placeholder="e.g., GL"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Fields to Include</Label>
                        <Button variant="outline" size="sm" onClick={addIdField}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Field
                        </Button>
                      </div>
                      
                      {editedForm.idconfig.fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="Field name"
                            value={field.name}
                            onChange={(e) => updateIdField(index, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Length"
                            value={field.length}
                            onChange={(e) => updateIdField(index, 'length', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIdField(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Increment Length</Label>
                      <Input
                        type="number"
                        value={editedForm.idconfig.incrementLength}
                        onChange={(e) => updateIdConfig({ incrementLength: parseInt(e.target.value) || 3 })}
                        className="w-20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of digits for auto-increment (e.g., 3 = 001, 002...)
                      </p>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Auto-Repeat */}
            <AccordionItem value="repeat">
              <AccordionTrigger>Auto-Repeat Logic</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Auto-Start Behavior</Label>
                  <Select
                    value={String(editedForm.autoStartRepeat)}
                    onValueChange={(v) => update('autoStartRepeat', parseInt(v) as 0 | 1 | 2)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Disabled</SelectItem>
                      <SelectItem value="1">Prompt user</SelectItem>
                      <SelectItem value="2">Force start immediately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editedForm.autoStartRepeat > 0 && (
                  <>
                    <div className="space-y-2">
                      <Label>Repeat Count Field</Label>
                      <Input
                        value={editedForm.repeatCountField || ''}
                        onChange={(e) => update('repeatCountField', e.target.value || undefined)}
                        placeholder="e.g., member_count"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Repeat Count Source Table</Label>
                      <Select
                        value={editedForm.repeatCountSource || '_current_'}
                        onValueChange={(v) => update('repeatCountSource', v === '_current_' ? undefined : v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Current table" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_current_">Current table</SelectItem>
                          {allForms.map(f => (
                            <SelectItem key={f.id} value={f.tablename}>
                              {f.displayname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Enforce Count</Label>
                      <Select
                        value={String(editedForm.repeatEnforceCount)}
                        onValueChange={(v) => update('repeatEnforceCount', parseInt(v) as 0 | 1 | 2 | 3)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Flexible (no enforcement)</SelectItem>
                          <SelectItem value="1">Warn if count mismatch</SelectItem>
                          <SelectItem value="2">Force exact count</SelectItem>
                          <SelectItem value="3">Auto-sync count</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Add missing import
import { useState } from "react";

export default FormManifestEditor;
