import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Database,
  Users,
  Plus,
  TrendingUp,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ProjectOverviewProps {
  project: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  stats: {
    surveysCount: number;
    submissionsCount: number;
    formsCount: number;
    fieldTeamCount: number;
    membersCount: number;
  };
  onTabChange: (tab: string) => void;
  onOpenUploadDialog: () => void;
}

interface SurveyStats {
  id: string;
  name: string;
  display_name: string;
  recordCount: number;
}

const ProjectOverview = ({ project, stats, onTabChange, onOpenUploadDialog }: ProjectOverviewProps) => {
  const navigate = useNavigate();

  // Fetch survey-level stats for Data Collection Summary
  const { data: surveyStats } = useQuery({
    queryKey: ['surveyStats', project.id],
    queryFn: async (): Promise<SurveyStats[]> => {
      // Get all surveys for the project
      const { data: surveys } = await supabase
        .from('survey_packages')
        .select('id, name, display_name')
        .eq('project_id', project.id)
        .order('version_date', { ascending: false });

      if (!surveys) return [];

      // Get record count for each survey
      const surveysWithCounts = await Promise.all(
        surveys.map(async (survey) => {
          const { count } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('survey_package_id', survey.id);

          return {
            ...survey,
            recordCount: count || 0
          };
        })
      );

      return surveysWithCounts.filter(s => s.recordCount > 0);
    },
    enabled: stats.submissionsCount > 0,
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("surveys")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Surveys</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.surveysCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.formsCount} form{stats.formsCount !== 1 ? 's' : ''} total
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("data")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submissionsCount}</div>
            <p className="text-xs text-muted-foreground">Data submissions</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("members")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Project Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.membersCount}</div>
            <p className="text-xs text-muted-foreground">Web users with access</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("team")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Field Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fieldTeamCount}</div>
            <p className="text-xs text-muted-foreground">App credentials</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Collection Summary */}
      {stats.submissionsCount > 0 && surveyStats && surveyStats.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Data Collection Summary</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTabChange("data")}
              >
                View all data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {surveyStats.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onTabChange("data")}
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{survey.display_name}</p>
                      <p className="text-sm text-muted-foreground">{survey.name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {survey.recordCount} record{survey.recordCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.surveysCount === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Get Started</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first survey to start collecting data. You can design a new survey
              or go to the Surveys tab to upload an existing survey package.
            </p>
            <Button onClick={() => navigate(`/app/projects/${project.slug}/surveys/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Survey
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectOverview;
