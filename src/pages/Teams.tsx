import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Key,
  Clock,
  Smartphone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fieldWorkers = [
  { 
    id: 1, 
    username: "team_alpha_1", 
    project: "Clinical Trial Alpha",
    lastSync: "5 mins ago",
    submissions: 145,
    status: "active",
    device: "Android 12"
  },
  { 
    id: 2, 
    username: "nurse_station_2", 
    project: "Clinical Trial Alpha",
    lastSync: "12 mins ago",
    submissions: 89,
    status: "active",
    device: "iOS 17"
  },
  { 
    id: 3, 
    username: "field_surveyor_1", 
    project: "Field Study Beta",
    lastSync: "2 hours ago",
    submissions: 234,
    status: "active",
    device: "Android 13"
  },
  { 
    id: 4, 
    username: "field_surveyor_2", 
    project: "Field Study Beta",
    lastSync: "3 days ago",
    submissions: 67,
    status: "inactive",
    device: "Android 11"
  },
  { 
    id: 5, 
    username: "community_worker_1", 
    project: "Community Health",
    lastSync: "1 hour ago",
    submissions: 312,
    status: "active",
    device: "Android 14"
  },
];

const Teams = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Field Teams</h1>
            <p className="text-muted-foreground">Manage app credentials for data collectors</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67</div>
              <p className="text-xs text-muted-foreground">Across 8 projects</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">24</div>
              <p className="text-xs text-muted-foreground">Synced in last hour</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">Records waiting</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by username or project..." 
            className="pl-10"
          />
        </div>

        {/* Field Workers Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>App Credentials</CardTitle>
            <CardDescription>Field worker login credentials for mobile data collection</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium font-mono">{worker.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{worker.project}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {worker.lastSync}
                      </div>
                    </TableCell>
                    <TableCell>{worker.submissions}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Smartphone className="h-3 w-3" />
                        {worker.device}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
                        {worker.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Activity</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Revoke Access</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Teams;
