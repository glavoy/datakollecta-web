import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  ListChecks,
  Upload,
  FileUp,
  Download,
  Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { parseSurveyXml } from "@/lib/xmlParser";

import { surveyService } from "@/services/surveyService";

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

interface SurveyPackage {
  id: string;
  name: string;
  display_name: string;
  version_date: string;
  status: string;
  description: string;
  zip_file_path: string;
  created_at: string;
}

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [surveys, setSurveys] = useState<SurveyPackage[]>([]);
  const [crfCount, setCrfCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

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

      if (projectError) throw projectError;
      setProject(projectData);

      // 2. Fetch Surveys (Survey Packages)
      const { data: surveysData, error: surveysError } = await supabase
        .from('survey_packages')
        .select('*')
        .eq('project_id', projectData.id)
        .order('version_date', { ascending: false });

      if (surveysError) throw surveysError;
      setSurveys(surveysData || []);

      // 3. Count CRFs (Forms) across all surveys or active ones
      // For now, getting total CRFs linked to this project
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
      navigate('/app/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSurvey = async (filePath: string, fileName: string) => {
    if (!filePath) {
      toast({
        title: "Error",
        description: "No file path available for this survey.",
        variant: "destructive",
      });
      return;
    }

    try {
      const signedUrl = await surveyService.getSurveyDownloadUrl(filePath);

      if (!signedUrl) {
        throw new Error("Could not generate download URL.");
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Download Started",
        description: "Your survey package is downloading.",
      });

    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download survey package.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    try {
      // 1. Find the survey to get the file path
      const surveyToDelete = surveys.find(s => s.id === surveyId);

      if (surveyToDelete && surveyToDelete.zip_file_path) {
        // 2. Delete from Storage
        const { error: storageError } = await supabase.storage
          .from('surveys')
          .remove([surveyToDelete.zip_file_path]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // We continue to delete the record even if storage delete fails
        }
      }

      // 3. Delete dependent Submissions and History
      // First, get all submission IDs and local_unique_ids for this survey
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('id, local_unique_id')
        .eq('survey_package_id', surveyId);

      if (submissionsData && submissionsData.length > 0) {
        // Map local_unique_ids to delete from formchanges (where record_uuid = local_unique_id)
        const recordUuids = submissionsData
          .map(s => s.local_unique_id)
          .filter(id => id !== null); // Filter out nulls just in case

        if (recordUuids.length > 0) {
          const { error: historyError } = await supabase
            .from('formchanges')
            .delete()
            .in('record_uuid', recordUuids);

          if (historyError) {
            console.error("Error deleting formchanges:", historyError);
            throw historyError;
          }
        }

        // Delete submissions
        const { error: submissionsError } = await supabase
          .from('submissions')
          .delete()
          .eq('survey_package_id', surveyId);

        if (submissionsError) {
          console.error("Error deleting submissions:", submissionsError);
          throw submissionsError;
        }
      }

      // 4. Delete dependent CRFs (Forms) manually
      const { error: crfDeleteError } = await supabase
        .from('crfs')
        .delete()
        .eq('survey_package_id', surveyId);

      if (crfDeleteError) {
        console.error("Error deleting CRFs:", crfDeleteError);
        throw crfDeleteError;
      }

      // 5. Delete from Database (The Survey Package itself)
      const { error } = await supabase
        .from('survey_packages')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;

      toast({
        title: "Survey deleted",
        description: "The survey package and its file have been removed.",
      });
      fetchProjectData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete survey.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !project) return;

    try {
      setUploading(true);

      // 1. Validate ZIP
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(uploadFile);

      let manifestFile = null;
      let manifestPath = "";

      // Iterate to find survey_manifest.gistx case-insensitively
      loadedZip.forEach((relativePath, file) => {
        if (relativePath.toLowerCase().endsWith("survey_manifest.gistx")) {
          manifestFile = file;
          manifestPath = relativePath;
        }
      });

      if (!manifestFile) {
        throw new Error("Invalid ZIP: survey_manifest.gistx is missing.");
      }

      // @ts-ignore
      const manifestContent = await manifestFile.async("string");
      const manifest = JSON.parse(manifestContent);

      // VALIDATE MANIFEST CRFS
      if (!manifest.crfs || !Array.isArray(manifest.crfs) || manifest.crfs.length === 0) {
        throw new Error("Invalid Manifest: 'crfs' array is missing or empty.");
      }

      // 2. Upload to Storage
      const filePath = `surveys/${project.id}/${uploadFile.name}`;
      const { error: storageError } = await supabase.storage
        .from('surveys')
        .upload(filePath, uploadFile);

      if (storageError) throw storageError;

      // 3. Insert into survey_packages
      // Extract unique ID from filename
      const rawFilename = uploadFile.name.replace(/\.zip$/i, "");
      const surveyId = rawFilename.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

      const { data: surveyData, error: dbError } = await supabase
        .from('survey_packages')
        .insert({
          project_id: project.id,
          name: surveyId, // This is the unique ID
          display_name: manifest.surveyName || rawFilename,
          version_date: new Date().toISOString(),
          description: manifest.description || "",
          zip_file_path: filePath,
          manifest: manifest,
          status: 'active',
          created_by: user?.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 4. Process CRFs and their XML files
      const crfsToInsert = [];

      for (const crfEntry of manifest.crfs) {
        const xmlFileName = `${crfEntry.tablename}.xml`;
        let xmlFile = null;

        // Find XML file in ZIP (might be in a subdirectory)
        loadedZip.forEach((path, file) => {
          if (path.toLowerCase().endsWith(xmlFileName.toLowerCase())) {
            xmlFile = file;
          }
        });

        if (!xmlFile) {
          console.warn(`XML file ${xmlFileName} not found in ZIP.`);
          continue;
        }

        const xmlContent = await xmlFile.async("string");
        const questions = parseSurveyXml(xmlContent);

        crfsToInsert.push({
          survey_package_id: surveyData.id,
          project_id: project.id,
          table_name: crfEntry.tablename,
          display_name: crfEntry.displayname,
          display_order: crfEntry.display_order || 0,
          is_base: crfEntry.isbase === 1,
          primary_key: crfEntry.primarykey,
          linking_field: crfEntry.linkingfield,
          id_config: crfEntry.idconfig,
          display_fields: crfEntry.display_fields,
          fields: questions // JSONB column containing parsed questions
        });
      }

      if (crfsToInsert.length > 0) {
        const { error: crfError } = await supabase
          .from('crfs')
          .insert(crfsToInsert);

        if (crfError) throw crfError;
      }

      toast({
        title: "Success",
        description: `Survey uploaded. ${crfsToInsert.length} questionnaire(s) processed.`,
      });

      setIsUploadOpen(false);
      setUploadFile(null);
      fetchProjectData();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process survey package.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="space-y-4">
          <Link to="/app/projects">
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
              <CardTitle className="text-sm font-medium">Surveys & Forms</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{surveys.length}</div>
              <p className="text-xs text-muted-foreground">Active survey versions</p>
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
                <h2 className="text-xl font-semibold">Surveys</h2>
                <p className="text-sm text-muted-foreground">Manage your study versions and questionnaires</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileUp className="mr-2 h-4 w-4" />
                      Upload ZIP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Survey Package</DialogTitle>
                      <DialogDescription>
                        Upload a completed survey package (ZIP) containing manifest.json and XML forms.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFileUpload}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="file">Survey ZIP File</Label>
                          <Input
                            id="file"
                            type="file"
                            accept=".zip"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          />

                          <p className="text-sm text-muted-foreground">
                            The zip filename will be used as the unique Survey ID (e.g., prism_css_v1.zip -&gt; prism_css_v1).
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={uploading}>
                          {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Upload
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button onClick={() => navigate(`/app/projects/${project.slug}/surveys/new`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Survey
                </Button>
              </div>
            </div>

            {surveys.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="p-4 bg-muted rounded-full">
                    <FileCode className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">No surveys yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Create a new survey using the designer or upload an existing package.
                    </p>
                  </div>
                  <Button onClick={() => navigate(`/app/projects/${project.slug}/surveys/new`)}>
                    Create First Survey
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Survey Name</TableHead>
                      <TableHead>Version Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{survey.display_name}</span>
                            <span className="text-xs text-muted-foreground">{survey.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(survey.version_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                            {survey.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/app/projects/${project.slug}/surveys/${survey.id}`)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Survey?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this survey version and all its questionnaires. Data collected for this version will also be deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSurvey(survey.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
    </AppLayout>
  );
};

export default ProjectDetail;