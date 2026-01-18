
import { useQuery } from "@tanstack/react-query";
import { submissionService } from "@/services/submissionService";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface FormChangesViewProps {
    recordUuid: string;
}

export const FormChangesView = ({ recordUuid }: FormChangesViewProps) => {
    const { data: changes, isLoading } = useQuery({
        queryKey: ["formchanges", recordUuid],
        queryFn: () => submissionService.getFormChanges(recordUuid),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!changes || changes.length === 0) {
        return (
            <div className="text-center p-4 text-muted-foreground">
                No history found for this record.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Old Value</TableHead>
                        <TableHead>New Value</TableHead>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {changes.map((change) => (
                        <TableRow key={change.id}>
                            <TableCell className="font-medium">{change.fieldname}</TableCell>
                            <TableCell className="text-red-500 font-mono text-xs">
                                {change.oldvalue || <span className="text-muted-foreground italic">empty</span>}
                            </TableCell>
                            <TableCell className="text-green-600 font-mono text-xs">
                                {change.newvalue || <span className="text-muted-foreground italic">empty</span>}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{change.surveyor_id}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {format(new Date(change.changed_at), "yyyy-MM-dd HH:mm:ss")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
