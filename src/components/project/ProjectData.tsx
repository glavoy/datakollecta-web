import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  Database,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileSpreadsheet
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface CRF {
  id: string;
  table_name: string;
  display_name: string;
  fields: any[];
  survey_package_id: string;
  survey_packages: {
    display_name: string;
  };
}

interface Submission {
  id: string;
  local_unique_id: string;
  data: Record<string, any>;
  surveyor_id: string;
  collected_at: string;
  submitted_at: string;
}

interface ProjectDataProps {
  projectId: string;
  projectName: string;
}

const ProjectData = ({ projectId, projectName }: ProjectDataProps) => {
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<Submission | null>(null);
  const pageSize = 25;

  // Fetch all forms (CRFs) for this project
  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ['projectForms', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crfs')
        .select(`
          id,
          table_name,
          display_name,
          fields,
          survey_package_id,
          survey_packages (
            display_name
          )
        `)
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as unknown as CRF[];
    },
  });

  // Get the selected form
  const selectedForm = forms?.find(f => f.id === selectedFormId);

  // Fetch submissions for the selected form
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['formSubmissions', projectId, selectedForm?.table_name],
    queryFn: async () => {
      if (!selectedForm) return [];
      const { data, error } = await supabase
        .from('submissions')
        .select('id, local_unique_id, data, surveyor_id, collected_at, submitted_at')
        .eq('project_id', projectId)
        .eq('table_name', selectedForm.table_name)
        .order('collected_at', { ascending: false });

      if (error) throw error;
      return data as Submission[];
    },
    enabled: !!selectedForm,
  });

  // Get display columns from form fields
  const displayColumns = useMemo(() => {
    if (!selectedForm?.fields || !Array.isArray(selectedForm.fields)) {
      return [];
    }

    // Filter to only show relevant fields (exclude calculated, information, etc. unless they have data)
    const visibleFields = selectedForm.fields.filter((field: any) => {
      const type = field.type?.toLowerCase();
      // Skip purely informational fields
      if (type === 'information' || type === 'button') return false;
      return true;
    });

    // Take first 6 fields for table display
    return visibleFields.slice(0, 6).map((field: any) => ({
      key: field.fieldname || field.id,
      label: field.text?.substring(0, 50) || field.fieldname || 'Unknown',
      fieldname: field.fieldname,
    }));
  }, [selectedForm]);

  // Filter submissions by search term
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (!searchTerm) return submissions;

    const term = searchTerm.toLowerCase();
    return submissions.filter(sub => {
      // Search in local_unique_id
      if (sub.local_unique_id?.toLowerCase().includes(term)) return true;
      // Search in surveyor
      if (sub.surveyor_id?.toLowerCase().includes(term)) return true;
      // Search in data values
      if (sub.data) {
        return Object.values(sub.data).some(val =>
          String(val).toLowerCase().includes(term)
        );
      }
      return false;
    });
  }, [submissions, searchTerm]);

  // Pagination
  const totalPages = Math.ceil((filteredSubmissions?.length || 0) / pageSize);
  const paginatedSubmissions = filteredSubmissions?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredSubmissions || filteredSubmissions.length === 0 || !selectedForm) return;

    // Get all unique field names from all submissions
    const allFieldNames = new Set<string>();
    filteredSubmissions.forEach(sub => {
      if (sub.data) {
        Object.keys(sub.data).forEach(key => allFieldNames.add(key));
      }
    });

    // Create header row
    const headers = ['local_unique_id', 'surveyor_id', 'collected_at', 'submitted_at', ...Array.from(allFieldNames)];

    // Create data rows
    const rows = filteredSubmissions.map(sub => {
      const row: string[] = [
        sub.local_unique_id || '',
        sub.surveyor_id || '',
        sub.collected_at || '',
        sub.submitted_at || '',
      ];
      allFieldNames.forEach(fieldName => {
        const value = sub.data?.[fieldName];
        const stringValue = value === null || value === undefined ? '' : String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
        row.push(escaped);
      });
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedForm.table_name}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get field value for display (truncated)
  const getFieldValue = (data: Record<string, any>, fieldname: string) => {
    const value = data?.[fieldname];
    if (value === null || value === undefined) return '-';
    const str = String(value);
    return str.length > 30 ? str.substring(0, 30) + '...' : str;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Data</h2>
          <p className="text-sm text-muted-foreground">
            View and export collected data for this project
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!filteredSubmissions?.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Form Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Select Form</CardTitle>
          <CardDescription>Choose a form to view its collected data</CardDescription>
        </CardHeader>
        <CardContent>
          {formsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading forms...
            </div>
          ) : forms && forms.length > 0 ? (
            <Select value={selectedFormId} onValueChange={(v) => { setSelectedFormId(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Select a form..." />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    <div className="flex flex-col">
                      <span>{form.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {form.survey_packages?.display_name} • {form.table_name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No forms found. Upload or create a survey first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      {selectedForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedForm.display_name}</CardTitle>
                <CardDescription>
                  {submissionsLoading
                    ? "Loading..."
                    : `${filteredSubmissions?.length || 0} record${filteredSubmissions?.length !== 1 ? 's' : ''}`}
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : paginatedSubmissions && paginatedSubmissions.length > 0 ? (
              <>
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Surveyor</TableHead>
                        <TableHead>Collected</TableHead>
                        {displayColumns.map(col => (
                          <TableHead key={col.key} title={col.label}>
                            {col.fieldname}
                          </TableHead>
                        ))}
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-mono text-xs">
                            {submission.local_unique_id?.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="text-sm">
                            {submission.surveyor_id || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {submission.collected_at
                              ? format(new Date(submission.collected_at), 'yyyy-MM-dd HH:mm')
                              : '-'}
                          </TableCell>
                          {displayColumns.map(col => (
                            <TableCell key={col.key} className="text-sm max-w-[150px] truncate">
                              {getFieldValue(submission.data, col.fieldname)}
                            </TableCell>
                          ))}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedRecord(submission)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No records match your search." : "No data collected yet for this form."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>
              ID: {selectedRecord?.local_unique_id}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div>
                  <p className="text-sm font-medium">Surveyor</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.surveyor_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Collected</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord.collected_at
                      ? format(new Date(selectedRecord.collected_at), 'yyyy-MM-dd HH:mm:ss')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord.submitted_at
                      ? format(new Date(selectedRecord.submitted_at), 'yyyy-MM-dd HH:mm:ss')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Form</p>
                  <p className="text-sm text-muted-foreground">{selectedForm?.display_name}</p>
                </div>
              </div>

              {/* Field Data */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Field</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRecord.data && Object.entries(selectedRecord.data)
                      .filter(([key]) => !key.startsWith('_')) // Hide internal fields
                      .map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-mono text-sm">{key}</TableCell>
                          <TableCell className="text-sm">
                            {value === null || value === undefined
                              ? <span className="text-muted-foreground">-</span>
                              : String(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectData;
