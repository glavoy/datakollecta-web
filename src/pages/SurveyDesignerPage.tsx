import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SurveyDesigner from "@/components/survey-designer/SurveyDesigner";

const SurveyDesignerPage = () => {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <SurveyDesigner />
      </div>
    </DashboardLayout>
  );
};

export default SurveyDesignerPage;
