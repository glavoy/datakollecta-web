import { NumericCheck, DateRange, LogicCheck } from "@/types/survey";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface ValidationEditorProps {
  fieldtype: string;
  numericCheck?: NumericCheck;
  dateRange?: DateRange;
  logicCheck?: LogicCheck;
  uniqueCheck?: { message: string };
  onNumericCheckChange: (check: NumericCheck | undefined) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onLogicCheckChange: (check: LogicCheck | undefined) => void;
  onUniqueCheckChange: (check: { message: string } | undefined) => void;
}

const ValidationEditor = ({
  fieldtype,
  numericCheck,
  dateRange,
  logicCheck,
  uniqueCheck,
  onNumericCheckChange,
  onDateRangeChange,
  onLogicCheckChange,
  onUniqueCheckChange,
}: ValidationEditorProps) => {
  const showNumeric = ['integer', 'text_integer'].includes(fieldtype);
  const showDate = ['date', 'datetime'].includes(fieldtype);

  return (
    <div className="space-y-6">
      {/* Numeric Validation */}
      {showNumeric && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="enableNumeric"
              checked={!!numericCheck}
              onCheckedChange={(checked) => {
                if (checked) {
                  onNumericCheckChange({ message: 'Value is out of range' });
                } else {
                  onNumericCheckChange(undefined);
                }
              }}
            />
            <Label htmlFor="enableNumeric">Enable Numeric Range Check</Label>
          </div>
          
          {numericCheck && (
            <div className="pl-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Minimum Value</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={numericCheck.minValue ?? ''}
                    onChange={(e) => onNumericCheckChange({
                      ...numericCheck,
                      minValue: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Maximum Value</Label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={numericCheck.maxValue ?? ''}
                    onChange={(e) => onNumericCheckChange({
                      ...numericCheck,
                      maxValue: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Other Allowed Values (comma-separated)</Label>
                <Input
                  placeholder="e.g., 99, 88"
                  value={numericCheck.otherValues ?? ''}
                  onChange={(e) => onNumericCheckChange({
                    ...numericCheck,
                    otherValues: e.target.value
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Error Message</Label>
                <Input
                  value={numericCheck.message}
                  onChange={(e) => onNumericCheckChange({
                    ...numericCheck,
                    message: e.target.value
                  })}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date Range Validation */}
      {showDate && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="enableDateRange"
              checked={!!dateRange}
              onCheckedChange={(checked) => {
                if (checked) {
                  onDateRangeChange({});
                } else {
                  onDateRangeChange(undefined);
                }
              }}
            />
            <Label htmlFor="enableDateRange">Enable Date Range</Label>
          </div>
          
          {dateRange && (
            <div className="pl-6 space-y-3">
              <p className="text-xs text-muted-foreground">
                Use ISO date (2025-01-01) or relative format (-3y, +1m, 0 for today)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Minimum Date</Label>
                  <Input
                    placeholder="-100y or 2020-01-01"
                    value={dateRange.minDate ?? ''}
                    onChange={(e) => onDateRangeChange({
                      ...dateRange,
                      minDate: e.target.value || undefined
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Maximum Date</Label>
                  <Input
                    placeholder="0 (today) or 2030-12-31"
                    value={dateRange.maxDate ?? ''}
                    onChange={(e) => onDateRangeChange({
                      ...dateRange,
                      maxDate: e.target.value || undefined
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Logic Check */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="enableLogic"
            checked={!!logicCheck}
            onCheckedChange={(checked) => {
              if (checked) {
                onLogicCheckChange({ condition: '', message: 'Validation failed' });
              } else {
                onLogicCheckChange(undefined);
              }
            }}
          />
          <Label htmlFor="enableLogic">Custom Logic Check</Label>
        </div>
        
        {logicCheck && (
          <div className="pl-6 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Condition Expression</Label>
              <Textarea
                placeholder="e.g., age >= 18"
                value={logicCheck.condition}
                onChange={(e) => onLogicCheckChange({
                  ...logicCheck,
                  condition: e.target.value
                })}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Use field names and operators: =, &lt;, &gt;, &lt;=, &gt;=, &lt;&gt;
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Error Message</Label>
              <Input
                value={logicCheck.message}
                onChange={(e) => onLogicCheckChange({
                  ...logicCheck,
                  message: e.target.value
                })}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Unique Check */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="enableUnique"
            checked={!!uniqueCheck}
            onCheckedChange={(checked) => {
              if (checked) {
                onUniqueCheckChange({ message: 'This value already exists' });
              } else {
                onUniqueCheckChange(undefined);
              }
            }}
          />
          <Label htmlFor="enableUnique">Require Unique Value</Label>
        </div>
        
        {uniqueCheck && (
          <div className="pl-6 space-y-1">
            <Label className="text-xs">Error Message</Label>
            <Input
              value={uniqueCheck.message}
              onChange={(e) => onUniqueCheckChange({ message: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationEditor;
