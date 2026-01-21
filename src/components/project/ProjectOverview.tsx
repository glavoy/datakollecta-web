import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Database,
  Users,
  Plus,
  Upload,
  Eye,
  UserPlus,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

const ProjectOverview = ({ project, stats, onTabChange }: ProjectOverviewProps) => {
  const navigate = useNavigate();

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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate(`/app/projects/${project.slug}/surveys/new`)}
            >
              <Plus className="h-5 w-5" />
              <span>Create Survey</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange("surveys")}
            >
              <Upload className="h-5 w-5" />
              <span>Upload Survey ZIP</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange("data")}
            >
              <Eye className="h-5 w-5" />
              <span>View Data</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange("team")}
            >
              <UserPlus className="h-5 w-5" />
              <span>Add Field Team</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      {stats.submissionsCount > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Data Collection Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>{stats.submissionsCount} record{stats.submissionsCount !== 1 ? 's' : ''} collected</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => onTabChange("data")}
              >
                View all data
              </Button>
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
              or upload an existing survey package.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate(`/app/projects/${project.slug}/surveys/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
              <Button variant="outline" onClick={() => onTabChange("surveys")}>
                <Upload className="h-4 w-4 mr-2" />
                Upload ZIP
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectOverview;
