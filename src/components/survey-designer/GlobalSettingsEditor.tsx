import { SurveyPackage } from "@/types/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";

interface GlobalSettingsEditorProps {
    surveyPackage: SurveyPackage;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (pkg: SurveyPackage) => void;
}

const GlobalSettingsEditor = ({ surveyPackage, open, onOpenChange, onSave }: GlobalSettingsEditorProps) => {
    const [editedPackage, setEditedPackage] = useState<SurveyPackage>({ ...surveyPackage });

    useEffect(() => {
        if (open) {
            setEditedPackage({ ...surveyPackage });
        }
    }, [open, surveyPackage]);

    const update = <K extends keyof SurveyPackage>(field: K, value: SurveyPackage[K]) => {
        setEditedPackage(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(editedPackage);
        onOpenChange(false);
    };

    // Auto-generate ID and DB name from name if they are empty
    const handleNameBlur = () => {
        const sanitized = editedPackage.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (!editedPackage.surveyId) {
            update('surveyId', sanitized);
        }

        if (!editedPackage.databaseName) {
            update('databaseName', `${sanitized}.sqlite`);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Global Survey Settings</SheetTitle>
                    <SheetDescription>
                        Configure global properties for the survey package.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="surveyName">Survey Name (Display Name)</Label>
                        <Input
                            id="surveyName"
                            value={editedPackage.name}
                            onChange={(e) => update('name', e.target.value)}
                            onBlur={handleNameBlur}
                            placeholder="e.g., Household Survey 2024"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surveyId">Survey ID (Unique)</Label>
                        <Input
                            id="surveyId"
                            value={editedPackage.surveyId}
                            onChange={(e) => update('surveyId', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                            placeholder="e.g., household_survey_2024"
                        />
                        <p className="text-xs text-muted-foreground">
                            Unique identifier for the survey (lowercase, no spaces). This matches the zip filename.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="databaseName">Database Name</Label>
                        <Input
                            id="databaseName"
                            value={editedPackage.databaseName || ''}
                            onChange={(e) => update('databaseName', e.target.value)}
                            placeholder="e.g., household_db.sqlite"
                        />
                        <p className="text-xs text-muted-foreground">
                            Name of the SQLite database file on the mobile device.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="version">Version</Label>
                        <Input
                            id="version"
                            value={editedPackage.version}
                            onChange={(e) => update('version', e.target.value)}
                            placeholder="1.0"
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Settings
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default GlobalSettingsEditor;
