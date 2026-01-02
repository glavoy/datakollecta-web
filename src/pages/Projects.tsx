import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Users,
  FileSpreadsheet,
  Database
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const projects = [
  { 
    id: 1, 
    name: "Clinical Trial Alpha", 
    slug: "clinical-alpha",
    description: "Phase 2 clinical trial for cardiovascular drug",
    status: "active",
    surveys: 5, 
    submissions: 1247, 
    team: 12,
    role: "Owner"
  },
  { 
    id: 2, 
    name: "Field Study Beta", 
    slug: "field-beta",
    description: "Agricultural survey in rural communities",
    status: "active",
    surveys: 3, 
    submissions: 856, 
    team: 8,
    role: "Admin"
  },
  { 
    id: 3, 
    name: "Community Health Survey", 
    slug: "community-health",
    description: "Public health assessment across 5 districts",
    status: "active",
    surveys: 7, 
    submissions: 2341, 
    team: 24,
    role: "Editor"
  },
  { 
    id: 4, 
    name: "Education Assessment 2024", 
    slug: "education-2024",
    description: "Student performance evaluation study",
    status: "draft",
    surveys: 2, 
    submissions: 0, 
    team: 5,
    role: "Owner"
  },
];

const Projects = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Manage your data collection projects</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-xs">
                      {project.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Code: {project.slug}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                    <DropdownMenuItem>Manage Team</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{project.surveys} surveys</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{project.submissions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{project.team} members</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
