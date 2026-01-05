import { SurveyQuestion } from "@/types/survey";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  Pencil, 
  Copy, 
  Trash2,
  Type,
  Circle,
  CheckSquare,
  ChevronDown,
  Calendar,
  Clock,
  Info,
  Calculator
} from "lucide-react";

interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  radio: <Circle className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  combobox: <ChevronDown className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  datetime: <Clock className="h-4 w-4" />,
  information: <Info className="h-4 w-4" />,
  automatic: <Calculator className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  text: 'Text',
  radio: 'Single Select',
  checkbox: 'Multi Select',
  combobox: 'Dropdown',
  date: 'Date',
  datetime: 'Date & Time',
  information: 'Information',
  automatic: 'Calculated',
};

const QuestionCard = ({ question, index, onEdit, onDuplicate, onDelete }: QuestionCardProps) => {
  const hasValidation = question.numericCheck || question.dateRange || question.logicCheck || question.uniqueCheck;
  const hasSkipLogic = (question.preskip && question.preskip.length > 0) || (question.postskip && question.postskip.length > 0);
  
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors group min-w-0 w-full">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 w-full">
          <div className="cursor-grab text-muted-foreground hover:text-foreground mt-1">
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Q{index + 1}</span>
              <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                {typeIcons[question.type]}
                {typeLabels[question.type]}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs truncate max-w-[200px]" title={question.fieldname}>
                {question.fieldname}
              </Badge>
              {hasValidation && (
                <Badge variant="default" className="text-xs flex-shrink-0">Validation</Badge>
              )}
              {hasSkipLogic && (
                <Badge variant="default" className="text-xs flex-shrink-0">Skip Logic</Badge>
              )}
            </div>
            
            <p className="text-foreground break-words text-sm mb-2 line-clamp-3">
              {question.text || <span className="text-muted-foreground italic">No question text</span>}
            </p>
            
            {question.responses && question.responses.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {question.responses.slice(0, 5).map((resp, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {resp.label}
                  </Badge>
                ))}
                {question.responses.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{question.responses.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
