import { useState, useEffect } from "react";
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
import { surveyService } from "@/services/surveyService";
import { toast } from "sonner";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  published: "default",
  draft: "secondary",
  ready: "outline",
  archived: "destructive"
};

const Surveys = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getAllSurveys();
      setSurveys(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleDownload = async (filePath: string, fileName: string) => {
    toast.promise(
      async () => {
        const url = await surveyService.getSurveyDownloadUrl(filePath);
        if (url) {
          window.open(url, '_blank');
        } else {
          throw new Error("Could not generate download link");
        }
      },
      {
        loading: 'Generating download link...',
        success: 'Download starting',
        error: 'Failed to download'
      }
    );
  };

  const filteredSurveys = surveys.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.projects?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSurveys.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No surveys found.
                    </TableCell>
                  </TableRow>
                )}
                {filteredSurveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{survey.display_name || survey.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{survey.projects?.name}</TableCell>
                    <TableCell>{survey.version_date}</TableCell>
                    <TableCell>{survey.crfs && survey.crfs[0] ? survey.crfs[0].count : 0} CRFs</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[survey.status] || "secondary"}>
                        {survey.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(survey.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(survey.zip_file_path, survey.name)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Package
                          </DropdownMenuItem>
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
