import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  Users,
  Database,
  Settings,
  Loader2,
  Edit2,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface SurveyPackage {
  id: string;
  name: string;
  version: string;
  status: string;
  created_at: string;
}

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [surveys, setSurveys] = useState<SurveyPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProjectData();
    }
  }, [slug, user]);

  const fetchProjectData = async () => {
    if (!user || !slug) return;

    try {
      setLoading(true);
      
      // 1. Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (projectError) {
        if (projectError.code === 'PGRST116') {
          toast({
            title: "Project not found",
            description: "This project doesn't exist or you don't have access to it.",
            variant: "destructive",
          });
          navigate('/dashboard/projects');
          return;
        }
        throw projectError;
      }

      setProject(projectData);

      // 2. Fetch surveys for this project
      const { data: surveysData, error: surveysError } = await supabase
        .from('survey_packages')
        .select('id, name, version, status, created_at')
        .eq('project_id', projectData.id)
        .order('created_at', { ascending: false });

      if (surveysError) throw surveysError;
      setSurveys(surveysData || []);

    } catch (error: any) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive",
      });
      navigate('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="space-y-4">
          <Link to="/dashboard/projects">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                <Badge variant={project.is_active ? 'default' : 'secondary'}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-muted-foreground">{project.description}</p>
              <p className="text-sm text-muted-foreground">
                Project Code: <span className="font-mono">{project.slug}</span>
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Project Settings
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Surveys</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{surveys.length}</div>
              <p className="text-xs text-muted-foreground">Active data collection forms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total data collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Active collectors</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="surveys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="data">Data & Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="surveys" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Surveys</h2>
                <p className="text-sm text-muted-foreground">Create and manage data collection forms</p>
              </div>
              <Button onClick={() => navigate(`/dashboard/projects/${project.slug}/surveys/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            </div>

            {surveys.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {surveys.map((survey) => (
                  <Card key={survey.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{survey.name}</CardTitle>
                        <Badge variant="outline">v{survey.version}</Badge>
                      </div>
                      <CardDescription>
                        Created {new Date(survey.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant={survey.status === 'ready' ? 'default' : 'secondary'}>
                          {survey.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/dashboard/projects/${project.slug}/surveys/${survey.id}`)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Empty state for surveys */
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Create your first survey to start collecting data for this project
                  </p>
                  <Button onClick={() => navigate(`/dashboard/projects/${project.slug}/surveys/new`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Survey
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Teams</h2>
                <p className="text-sm text-muted-foreground">Manage field collection teams</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </div>

            {/* Empty state for teams */}
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create teams to organize your field data collectors
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Data & Submissions</h2>
              <p className="text-sm text-muted-foreground">View and export collected data</p>
            </div>

            {/* Empty state for submissions */}
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No data yet</h3>
                <p className="text-muted-foreground text-center">
                  Data submissions will appear here once you start collecting
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
