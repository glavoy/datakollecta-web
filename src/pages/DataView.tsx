
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  Filter,
  MoreVertical,
  Eye,
  History,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useQuery } from "@tanstack/react-query";
import { submissionService } from "@/services/submissionService";
import { useAuth } from "@/hooks/useAuth";
import { teamService } from "@/services/teamService";
import { format } from "date-fns";
import { FormChangesView } from "@/components/FormChangesView";

const DataView = () => {
  const { session } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);

  // Fetch projects for the filter
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: teamService.getProjects,
    enabled: !!session,
  });

  // Fetch submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions", selectedProjectId],
    queryFn: async (): Promise<import("@/services/submissionService").Submission[]> => {
      if (selectedProjectId === "all") {
        if (projects && projects.length > 0) {
          // Default to first project for now to avoid massive queries or RLS issues
          // Ideally we would fetch all, but let's start safe
          return submissionService.getSubmissions(projects[0].id);
        }
        return [];
      }
      return submissionService.getSubmissions(selectedProjectId);
    },
    enabled: !!session && (selectedProjectId !== "all" || (!!projects && projects.length > 0)),
  });

  // Fetch Sync Stats
  const { data: syncStats } = useQuery({
    queryKey: ["syncStats", selectedProjectId],
    queryFn: async () => {
      const projectId = selectedProjectId === "all" ? (projects?.[0]?.id) : selectedProjectId;
      if (!projectId) return [];
      return submissionService.getSyncStats(projectId);
    },
    enabled: !!session && (selectedProjectId !== "all" || (!!projects && projects.length > 0)),
  });

  // Filter submissions client-side for search
  const filteredSubmissions = submissions?.filter((sub) => {
    const matchesSearch = searchTerm === "" ||
      sub.local_unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.surveyor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.survey_name && sub.survey_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  }) || [];

  const handleExportCSV = () => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) return;

    // Flatten data for CSV
    const csvData = filteredSubmissions.map(sub => ({
      id: sub.local_unique_id,
      survey: sub.survey_name || sub.table_name,
      surveyor: sub.surveyor_id,
      collected_at: sub.collected_at,
      updated_at: sub.updated_at,
      app_version: sub.app_version || "",
      device_id: sub.device_id || "",
      ...sub.data // Spread the actual form data columns
    }));

    // Generate CSV content
    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map(row =>
      Object.values(row).map(value => {
        const stringValue = String(value ?? "");
        // Escape quotes and wrap in quotes if contains comma
        return stringValue.includes(",") || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(",")
    ).join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `submissions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
            <p className="text-muted-foreground">Browse and export collected data</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportCSV} disabled={!filteredSubmissions.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Sync Status Cards */}
        {syncStats && syncStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {syncStats.map(stat => (
              <Card key={stat.table_name} className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.table_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.total_records}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Last sync: {stat.last_sync ? format(new Date(stat.last_sync), "MMM d, HH:mm") : "Never"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID, surveyor, survey..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((project: { id: string, name: string }) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Submissions Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Data Records</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading..."
                : `Showing ${filteredSubmissions.length} of ${filteredSubmissions.length} submissions`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Surveyor</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Synced</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-mono text-sm" title={submission.local_unique_id}>
                      {submission.local_unique_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{submission.survey_name || submission.table_name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{submission.surveyor_id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(submission.collected_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(submission.updated_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Data
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setViewHistoryId(submission.record_uuid || submission.local_unique_id)}>
                            <History className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem>Download JSON</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredSubmissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Record History Dialog */}
        <Dialog open={!!viewHistoryId} onOpenChange={(open) => !open && setViewHistoryId(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record History</DialogTitle>
              <DialogDescription>
                Audit log for record
              </DialogDescription>
            </DialogHeader>
            {viewHistoryId && (
              <FormChangesView recordUuid={viewHistoryId} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default DataView;
