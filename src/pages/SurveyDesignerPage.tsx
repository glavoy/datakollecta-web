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
  const { slug } = useParams<{ slug: string }>();
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
            navigate('/dashboard/projects');
            return;
          }
          throw projectError;
        }
        
        const pid = projectData.id;
        setProjectId(pid);

        // 2. Fetch existing protocol/survey forms for this project
        // If no forms exist yet, it will return an empty list in the package
        try {
          const pkg = await surveyService.getSurveyPackage(pid);
          // If the project name differs from the one in state (rare), we can sync it here
          // but mainly we want the forms.
          setInitialPackage(pkg);
        } catch (err) {
          // If getting package fails (maybe CRFs table empty?), we might just start fresh.
          // But surveyService.getSurveyPackage should handle empty CRFs gracefully.
          console.log('No existing protocol found or error loading:', err);
          
          // Fallback: Start with basic project info
          setInitialPackage({
            id: pid,
            name: projectData.name,
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
  }, [slug, user]);

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
