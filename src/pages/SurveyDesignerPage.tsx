import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SurveyDesigner from "@/components/survey-designer/SurveyDesigner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { surveyService } from "@/services/surveyService";
import { SurveyPackage } from "@/types/survey";

const SurveyDesignerPage = () => {
  const { slug, surveyId } = useParams<{ slug: string; surveyId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [initialPackage, setInitialPackage] = useState<SurveyPackage | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // 1. Fetch project if slug is present
        if (slug) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('id')
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
          setProjectId(projectData.id);
        }

        // 2. Fetch survey package if surveyId is present
        if (surveyId) {
          const pkg = await surveyService.getSurveyPackage(surveyId);
          setInitialPackage(pkg);
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <SurveyDesigner 
          projectId={projectId} 
          userId={user?.id} 
          initialPackage={initialPackage} 
        />
      </div>
    </DashboardLayout>
  );
};

export default SurveyDesignerPage;
