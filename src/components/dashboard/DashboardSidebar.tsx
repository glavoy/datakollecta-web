import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Users,
  Database as DatabaseIcon,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Field Teams", href: "/dashboard/teams", icon: Users },
  { name: "Submissions", href: "/dashboard/data", icon: DatabaseIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-4">
          <img src="/logo.png" alt="DataKollecta" className="h-20 w-auto" />
          <span className="text-xl font-semibold text-card-foreground">DataKollecta</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        {user && (
          <div className="px-4 py-2 mb-2 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
