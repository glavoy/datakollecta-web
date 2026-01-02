import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download,
  Filter,
  MoreVertical,
  Eye
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

const submissions = [
  { 
    id: "SUB-001247", 
    form: "Patient Intake",
    project: "Clinical Trial Alpha",
    surveyor: "team_alpha_1",
    collectedAt: "2024-01-18 14:32",
    syncedAt: "2024-01-18 14:35",
    status: "verified"
  },
  { 
    id: "SUB-001246", 
    form: "Follow-up Assessment",
    project: "Clinical Trial Alpha",
    surveyor: "nurse_station_2",
    collectedAt: "2024-01-18 13:45",
    syncedAt: "2024-01-18 14:20",
    status: "verified"
  },
  { 
    id: "SUB-001245", 
    form: "Household Survey",
    project: "Field Study Beta",
    surveyor: "field_surveyor_1",
    collectedAt: "2024-01-18 11:20",
    syncedAt: "2024-01-18 12:30",
    status: "pending_review"
  },
  { 
    id: "SUB-001244", 
    form: "Water Quality Assessment",
    project: "Community Health",
    surveyor: "community_worker_1",
    collectedAt: "2024-01-18 10:15",
    syncedAt: "2024-01-18 11:45",
    status: "verified"
  },
  { 
    id: "SUB-001243", 
    form: "Nutrition Screening",
    project: "Community Health",
    surveyor: "community_worker_1",
    collectedAt: "2024-01-18 09:30",
    syncedAt: "2024-01-18 11:45",
    status: "flagged"
  },
];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  verified: "default",
  pending_review: "secondary",
  flagged: "destructive"
};

const DataView = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
            <p className="text-muted-foreground">Browse and export collected data</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search submissions..." 
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="clinical-alpha">Clinical Trial Alpha</SelectItem>
              <SelectItem value="field-beta">Field Study Beta</SelectItem>
              <SelectItem value="community-health">Community Health</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Forms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              <SelectItem value="intake">Patient Intake</SelectItem>
              <SelectItem value="followup">Follow-up Assessment</SelectItem>
              <SelectItem value="household">Household Survey</SelectItem>
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
            <CardDescription>Showing 5 of 12,847 submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Surveyor</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Synced</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-mono text-sm">{submission.id}</TableCell>
                    <TableCell className="font-medium">{submission.form}</TableCell>
                    <TableCell className="text-muted-foreground">{submission.project}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{submission.surveyor}</TableCell>
                    <TableCell className="text-muted-foreground">{submission.collectedAt}</TableCell>
                    <TableCell className="text-muted-foreground">{submission.syncedAt}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[submission.status]}>
                        {submission.status.replace('_', ' ')}
                      </Badge>
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>View History</DropdownMenuItem>
                          <DropdownMenuItem>Download JSON</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Flag Record</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DataView;
