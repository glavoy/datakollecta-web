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
  FileCode,
  ListChecks
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
  version?: string;
  status?: string;
}

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [crfCount, setCrfCount] = useState(0);
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

      // 2. Count CRFs (Forms)
      const { count, error: countError } = await supabase
        .from('crfs')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectData.id);

      if (countError) throw countError;
      setCrfCount(count || 0);

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
              <CardTitle className="text-sm font-medium">Forms (CRFs)</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crfCount}</div>
              <p className="text-xs text-muted-foreground">Active questionnaires</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Field workers</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="design" className="space-y-4">
          <TabsList>
            <TabsTrigger value="design">Study Design</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="data">Data & Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Study Protocol & Forms</h2>
                <p className="text-sm text-muted-foreground">Manage your CRFs and data dictionary</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    Form Designer
                  </CardTitle>
                  <CardDescription>
                    Design your CRFs, skip logic, and validation rules.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Version:</span>
                      <Badge variant="outline">v{project.version || '1.0'}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => navigate(`/dashboard/projects/${project.slug}/surveys/new`)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Open Designer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common tasks for study management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download Protocol (ZIP)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Assign Team Access
                  </Button>
                </CardContent>
              </Card>
            </div>
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
