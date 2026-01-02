import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Upload,
  Download,
  MoreVertical,
  FileSpreadsheet
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

const surveys = [
  { 
    id: 1, 
    name: "Patient Intake Form", 
    project: "Clinical Trial Alpha",
    version: "2.1",
    status: "published",
    forms: 3,
    lastModified: "2024-01-15"
  },
  { 
    id: 2, 
    name: "Follow-up Assessment", 
    project: "Clinical Trial Alpha",
    version: "1.0",
    status: "published",
    forms: 2,
    lastModified: "2024-01-12"
  },
  { 
    id: 3, 
    name: "Household Survey", 
    project: "Field Study Beta",
    version: "3.2",
    status: "published",
    forms: 5,
    lastModified: "2024-01-10"
  },
  { 
    id: 4, 
    name: "Water Quality Assessment", 
    project: "Community Health",
    version: "1.1",
    status: "draft",
    forms: 4,
    lastModified: "2024-01-18"
  },
  { 
    id: 5, 
    name: "Nutrition Screening", 
    project: "Community Health",
    version: "2.0",
    status: "processing",
    forms: 3,
    lastModified: "2024-01-17"
  },
];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  published: "default",
  draft: "secondary",
  processing: "outline",
  archived: "destructive"
};

const Surveys = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Survey Packages</h1>
            <p className="text-muted-foreground">Manage your survey definitions and CRFs</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button asChild>
              <a href="/dashboard/surveys/designer">
                <Plus className="h-4 w-4 mr-2" />
                New Survey
              </a>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search surveys..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Surveys Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Surveys</CardTitle>
            <CardDescription>Browse and manage survey packages across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Forms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{survey.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{survey.project}</TableCell>
                    <TableCell>v{survey.version}</TableCell>
                    <TableCell>{survey.forms} CRFs</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[survey.status]}>
                        {survey.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{survey.lastModified}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download Package
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Definition</DropdownMenuItem>
                          <DropdownMenuItem>View CRFs</DropdownMenuItem>
                          <DropdownMenuItem>New Version</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
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

export default Surveys;
