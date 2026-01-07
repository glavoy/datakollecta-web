import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Smartphone, CloudOff } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 text-accent mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Enterprise-Grade Security</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-6 leading-tight">
            Collect Data Anywhere.
            <span className="block text-secondary-foreground">Manage It Everywhere.</span>
          </h1>

          <p className="text-lg md:text-xl text-accent/80 mb-8 max-w-2xl mx-auto">
            A comprehensive platform for research projects, field surveys, and clinical trials.
            Design surveys, manage teams, and ensure data integrity across offline and online environments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="xl" variant="heroPrimary" asChild>
              <Link to="/app/projects" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="hero" asChild>
              <Link to="/app/projects">View Demo</Link>
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm">
              <CloudOff className="h-4 w-4" />
              Offline-First
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm">
              <Smartphone className="h-4 w-4" />
              Mobile Ready
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm">
              <Shield className="h-4 w-4" />
              HIPAA Compliant
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
