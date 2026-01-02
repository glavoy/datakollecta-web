import { Upload, Settings, Smartphone, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Survey Definition",
    description: "Import your survey structure from Excel or ODK XForms. The system parses and validates your CRF definitions automatically."
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure & Publish",
    description: "Set up versioning, configure validation rules, and publish your survey package for field deployment."
  },
  {
    number: "03",
    icon: Smartphone,
    title: "Collect Data Offline",
    description: "Field workers download surveys, collect data anywhere—even without internet—and sync when connected."
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Analyze & Export",
    description: "View submissions in real-time, apply filters, and export data for further analysis."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How DataKollecta Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From survey design to data analysis in four simple steps.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-px bg-border" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-card border border-border mb-6">
                  <span className="absolute -top-3 -right-3 text-xs font-bold text-secondary bg-secondary/10 px-2 py-1">
                    {step.number}
                  </span>
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
