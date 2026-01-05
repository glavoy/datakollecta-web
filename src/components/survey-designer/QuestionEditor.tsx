import { useState, useEffect } from "react";
import { SurveyQuestion, QuestionType, FieldType } from "@/types/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import ResponseOptionsEditor from "./ResponseOptionsEditor";
import SkipLogicEditor from "./SkipLogicEditor";
import ValidationEditor from "./ValidationEditor";
import CalculationEditor from "./CalculationEditor";

interface QuestionEditorProps {
  question: SurveyQuestion | null;
  allQuestions: SurveyQuestion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: SurveyQuestion) => void;
}

const QuestionEditor = ({ question, allQuestions, open, onOpenChange, onSave }: QuestionEditorProps) => {
  // Initialize synchronously from prop to avoid render flash/null issues
  const [editedQuestion, setEditedQuestion] = useState<SurveyQuestion | null>(() => 
    question ? JSON.parse(JSON.stringify(question)) : null
  );

  // Sync with prop when it changes
  useEffect(() => {
    if (question) {
      setEditedQuestion(JSON.parse(JSON.stringify(question)));
    }
  }, [question]);

  if (!editedQuestion) return null;

  const showResponses = ['radio', 'checkbox', 'combobox'].includes(editedQuestion.type);
  const showCalculation = editedQuestion.type === 'automatic';
  const isReadOnly = editedQuestion.type === 'information';

  const handleSave = () => {
    onSave(editedQuestion);
    onOpenChange(false);
  };

  const update = <K extends keyof SurveyQuestion>(field: K, value: SurveyQuestion[K]) => {
    setEditedQuestion(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Get questions that appear before this one (for skip logic)
  const previousQuestions = allQuestions.filter(q => q.id !== editedQuestion.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Question</SheetTitle>
          <SheetDescription>
            Configure question properties, responses, validation, and logic
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="responses" disabled={!showResponses && !showCalculation}>
                {showCalculation ? 'Calculation' : 'Responses'}
              </TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="logic">Skip Logic</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Question Type */}
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={editedQuestion.type}
                  onValueChange={(v) => update('type', v as QuestionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="radio">Single Select (Radio)</SelectItem>
                    <SelectItem value="checkbox">Multi Select (Checkbox)</SelectItem>
                    <SelectItem value="combobox">Dropdown (Combobox)</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="datetime">Date & Time</SelectItem>
                    <SelectItem value="information">Information (Read-only)</SelectItem>
                    <SelectItem value="automatic">Calculated (Automatic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Field Name */}
              <div className="space-y-2">
                <Label>Field Name (Variable)</Label>
                <Input
                  value={editedQuestion.fieldname}
                  onChange={(e) => update('fieldname', e.target.value.replace(/\s/g, '_').toLowerCase())}
                  placeholder="e.g., participant_name"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier used in logic and database. No spaces allowed.
                </p>
              </div>

              {/* Field Type */}
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select
                  value={editedQuestion.fieldtype}
                  onValueChange={(v) => update('fieldtype', v as FieldType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="integer">Integer</SelectItem>
                    <SelectItem value="text_integer">Text/Integer</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="datetime">DateTime</SelectItem>
                    <SelectItem value="n/a">N/A (Information only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={editedQuestion.text}
                  onChange={(e) => update('text', e.target.value)}
                  placeholder="Enter the question or label text..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Use [[fieldname]] to reference values from previous questions.
                </p>
              </div>

              {/* Max Characters */}
              {!isReadOnly && !showCalculation && (
                <div className="space-y-2">
                  <Label>Max Characters (optional)</Label>
                  <Input
                    value={editedQuestion.maxCharacters ?? ''}
                    onChange={(e) => update('maxCharacters', e.target.value || undefined)}
                    placeholder="e.g., 80 or =10 for exact length"
                  />
                </div>
              )}

              {/* Input Mask */}
              {editedQuestion.type === 'text' && (
                <div className="space-y-2">
                  <Label>Input Mask (optional)</Label>
                  <Input
                    value={editedQuestion.mask ?? ''}
                    onChange={(e) => update('mask', e.target.value || undefined)}
                    placeholder="e.g., [A-Z][0-9][0-9]-[0-9][0-9][0-9]"
                  />
                  <p className="text-xs text-muted-foreground">
                    [0-9] = digit, [A-Z] = letter, [A-Z0-9] = alphanumeric
                  </p>
                </div>
              )}

              {/* Don't Know / Refuse options */}
              {showResponses && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Don't Know Value</Label>
                    <Input
                      value={editedQuestion.dontKnow ?? ''}
                      onChange={(e) => update('dontKnow', e.target.value || undefined)}
                      placeholder="e.g., 99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Refuse Value</Label>
                    <Input
                      value={editedQuestion.refuse ?? ''}
                      onChange={(e) => update('refuse', e.target.value || undefined)}
                      placeholder="e.g., 88"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="responses" className="mt-4">
              {showResponses && (
                <ResponseOptionsEditor
                  responses={editedQuestion.responses || []}
                  onChange={(responses) => update('responses', responses)}
                />
              )}
              {showCalculation && (
                <CalculationEditor
                  calculation={editedQuestion.calculation}
                  availableFields={previousQuestions}
                  onChange={(calc) => update('calculation', calc)}
                />
              )}
            </TabsContent>

            <TabsContent value="validation" className="mt-4">
              <ValidationEditor
                fieldtype={editedQuestion.fieldtype}
                numericCheck={editedQuestion.numericCheck}
                dateRange={editedQuestion.dateRange}
                logicCheck={editedQuestion.logicCheck}
                uniqueCheck={editedQuestion.uniqueCheck}
                onNumericCheckChange={(check) => update('numericCheck', check)}
                onDateRangeChange={(range) => update('dateRange', range)}
                onLogicCheckChange={(check) => update('logicCheck', check)}
                onUniqueCheckChange={(check) => update('uniqueCheck', check)}
              />
            </TabsContent>

            <TabsContent value="logic" className="space-y-6 mt-4">
              <SkipLogicEditor
                type="preskip"
                rules={editedQuestion.preskip || []}
                availableFields={allQuestions}
                onChange={(rules) => update('preskip', rules)}
              />
              <SkipLogicEditor
                type="postskip"
                rules={editedQuestion.postskip || []}
                availableFields={allQuestions}
                onChange={(rules) => update('postskip', rules)}
              />
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Question
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default QuestionEditor;
