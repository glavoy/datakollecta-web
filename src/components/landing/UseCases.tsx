import { FlaskConical, Stethoscope, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const useCases = [
  {
    icon: FlaskConical,
    title: "Research Projects",
    description: "Academic and institutional research requiring structured data collection across multiple sites.",
    features: ["Multi-site coordination", "Protocol versioning", "IRB compliance support"]
  },
  {
    icon: Stethoscope,
    title: "Clinical Trials",
    description: "Collect patient data with strict validation rules and audit trails for regulatory compliance.",
    features: ["HIPAA compliance", "Audit logging", "Data validation"]
  },
  {
    icon: Building2,
    title: "Field Surveys",
    description: "Large-scale surveys in remote areas with unreliable connectivity.",
    features: ["Offline-first design", "GPS tagging", "Media attachments"]
  }
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
            Built for Your Use Case
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're running clinical trials, academic research, or field surveys, DataKollecta adapts to your needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-background border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center mb-4">
                  <useCase.icon className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {useCase.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-1.5 h-1.5 bg-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
