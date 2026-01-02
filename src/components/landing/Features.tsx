import { 
  FileSpreadsheet, 
  Users, 
  Database, 
  Download,
  Shield,
  RefreshCcw
} from "lucide-react";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Survey Design Engine",
    description: "Upload Excel or XML definitions. Support for complex Case Report Forms with versioning and lifecycle management."
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Manage field workers with dedicated credentials. Track sessions and monitor data collection progress in real-time."
  },
  {
    icon: Database,
    title: "Flexible Data Storage",
    description: "Store submissions in JSONB format. Accommodate varying survey structures without schema changes."
  },
  {
    icon: RefreshCcw,
    title: "Offline Sync",
    description: "Collect data offline and sync when connected. Built-in deduplication and conflict resolution."
  },
  {
    icon: Shield,
    title: "Row-Level Security",
    description: "Strict data isolation by project. Users only see what they're authorized to access."
  },
  {
    icon: Download,
    title: "Export & Analysis",
    description: "Export data to CSV, Excel, or JSON. Built-in data grid with powerful filtering capabilities."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
            Everything You Need for Data Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for researchers, field teams, and clinical trials. Handle complex data structures with ease.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
