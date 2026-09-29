import React from "react";
import { Link, useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../features/auth/AuthContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { LogOut, User as UserIcon } from "lucide-react";

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-slate-400 font-medium">Portal</span>
              <span className="text-xs text-indigo-400 font-bold ml-1.5 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {user?.fullName}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-2"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
              <div>
                {title && <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>}
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
