import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import SurveyDesigner from "@/components/survey-designer/SurveyDesigner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { surveyService } from "@/services/surveyService";
import { SurveyPackage } from "@/types/survey";

const SurveyDesignerPage = () => {
  const { slug, surveyId } = useParams<{ slug: string; surveyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [initialPackage, setInitialPackage] = useState<SurveyPackage | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!user || !slug) return;

      try {
        setLoading(true);

        // 1. Fetch project ID from slug
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, name')
          .eq('slug', slug)
          .single();

        if (projectError) {
          if (projectError.code === 'PGRST116') {
            toast({
              title: "Project not found",
              description: "This project doesn't exist or you don't have access to it.",
              variant: "destructive",
            });
            navigate('/app/projects');
            return;
          }
          throw projectError;
        }

        const pid = projectData.id;
        setProjectId(pid);

        // 2. Load Survey Package
        if (surveyId) {
          // Edit existing survey
          try {
            const pkg = await surveyService.getSurveyPackage(surveyId);
            setInitialPackage(pkg);
          } catch (err) {
            console.error('Error loading survey:', err);
            toast({
              title: "Error",
              description: "Failed to load the requested survey.",
              variant: "destructive",
            });
            navigate(`/app/projects/${slug}`);
          }
        } else {
          // Create New Survey - Start Fresh
          setInitialPackage({
            id: crypto.randomUUID(),
            name: `${projectData.name} Survey`,
            version: '1.0',
            forms: []
          });
        }

      } catch (error: any) {
        console.error('Error initializing designer:', error);
        toast({
          title: "Error",
          description: "Failed to initialize survey designer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [slug, surveyId, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)]">
        <SurveyDesigner
          projectId={projectId}
          userId={user?.id}
          initialPackage={initialPackage}
        />
      </div>
    </AppLayout>
  );
};

export default SurveyDesignerPage;
