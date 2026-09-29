import React from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../features/auth/AuthContext";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { GraduationCap, LogIn, UserPlus, LayoutDashboard, LogOut, BookOpen } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "INSTRUCTOR":
        return "/instructor";
      case "STUDENT":
      default:
        return "/student";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              NEXUS<span className="text-indigo-400">LMS</span>
            </span>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            to="/courses"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Jelajah Kursus
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link to={getDashboardLink()}>
                <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">{user.fullName}</p>
                  <Badge variant="primary" size="sm" className="mt-0.5 text-[9px] px-1.5 py-0">
                    {user.role}
                  </Badge>
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
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
