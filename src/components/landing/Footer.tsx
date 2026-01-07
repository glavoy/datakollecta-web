import { Database } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-accent py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-8 w-8" />
              <span className="text-xl font-semibold">DataKollecta</span>
            </div>
            <p className="text-accent/70 max-w-md">
              Comprehensive data collection platform for research projects, field surveys, and clinical trials.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-accent/70">
              <li><a href="#features" className="hover:text-accent transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-accent transition-colors">How It Works</a></li>
              <li><a href="#use-cases" className="hover:text-accent transition-colors">Use Cases</a></li>
              <li><Link to="/app/projects" className="hover:text-accent transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-accent/70">
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-accent/20 pt-8 text-center text-accent/60 text-sm">
          © {new Date().getFullYear()} DataKollecta. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
