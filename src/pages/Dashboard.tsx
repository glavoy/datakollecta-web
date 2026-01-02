import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderKanban, 
  FileSpreadsheet, 
  Users, 
  Database,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";

const recentSubmissions = [
  { id: 1, form: "Patient Intake", project: "Clinical Trial Alpha", time: "2 mins ago", status: "synced" },
  { id: 2, form: "Follow-up Survey", project: "Field Study Beta", time: "15 mins ago", status: "synced" },
  { id: 3, form: "Lab Results", project: "Clinical Trial Alpha", time: "1 hour ago", status: "synced" },
  { id: 4, form: "Site Assessment", project: "Community Health", time: "2 hours ago", status: "pending" },
];

const activeProjects = [
  { id: 1, name: "Clinical Trial Alpha", surveys: 5, submissions: 1247, team: 12 },
  { id: 2, name: "Field Study Beta", surveys: 3, submissions: 856, team: 8 },
  { id: 3, name: "Community Health", surveys: 7, submissions: 2341, team: 24 },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your data collection overview.</p>
          </div>
          <Button asChild>
            <Link to="/dashboard/projects">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Active Projects" 
            value={8} 
            icon={FolderKanban}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard 
            title="Published Surveys" 
            value={24} 
            icon={FileSpreadsheet}
            description="Across all projects"
          />
          <StatsCard 
            title="Field Workers" 
            value={67} 
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard 
            title="Total Submissions" 
            value="12,847" 
            icon={Database}
            trend={{ value: 23, isPositive: true }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Submissions */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest data synced from field devices</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/data">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-card-foreground">{submission.form}</p>
                      <p className="text-sm text-muted-foreground">{submission.project}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={submission.status === 'synced' ? 'default' : 'secondary'}>
                        {submission.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{submission.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Projects with ongoing data collection</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/projects">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="p-4 bg-background border border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-card-foreground">{project.name}</h4>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{project.surveys} surveys</span>
                      <span>{project.submissions.toLocaleString()} submissions</span>
                      <span>{project.team} team members</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
