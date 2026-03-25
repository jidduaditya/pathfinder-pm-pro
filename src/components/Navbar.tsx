import { useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, FileText, Map, MessageSquare } from "lucide-react";
import NavLink from "@/components/NavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { removeToken } from "@/lib/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-navy">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/")}
            className="text-lg font-semibold tracking-tight text-navy-foreground"
          >
            PM-GPS
          </button>
          {localStorage.getItem("pmgps_roadmap_id") && (
            <button
              onClick={() => navigate(`/roadmap/${localStorage.getItem("pmgps_roadmap_id")}`)}
              className="flex items-center gap-1 text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"
            >
              <Map className="h-3.5 w-3.5" /> My Roadmap
            </button>
          )}
          <button
            onClick={() => navigate("/coach")}
            className="flex items-center gap-1 text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Coach
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none ring-offset-navy focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/results")}>
              <FileText className="mr-2 h-4 w-4" />
              My results
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              removeToken();
              navigate("/");
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
