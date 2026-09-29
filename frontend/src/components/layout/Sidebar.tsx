import React from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../../features/auth/AuthContext";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  PlusCircle,
  Users,
  FolderTree,
  FileCheck,
  UserCheck,
  Compass,
} from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const studentLinks = [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/student/my-courses", label: "Kursus Saya", icon: GraduationCap },
    { to: "/student/courses", label: "Katalog Kursus", icon: Compass },
    { to: "/student/profile", label: "Profil Saya", icon: UserCheck },
  ];

  const instructorLinks = [
    { to: "/instructor", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/instructor/courses", label: "Daftar Kursus", icon: BookOpen },
    { to: "/instructor/courses/create", label: "Buat Kursus", icon: PlusCircle },
    { to: "/instructor/students", label: "Siswa Terdaftar", icon: Users },
  ];

  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/users", label: "Pengguna", icon: Users },
    { to: "/admin/courses", label: "Semua Kursus", icon: BookOpen },
    { to: "/admin/categories", label: "Kategori", icon: FolderTree },
    { to: "/admin/enrollments", label: "Pendaftaran", icon: FileCheck },
  ];

  const links =
    user.role === "ADMIN"
      ? adminLinks
      : user.role === "INSTRUCTOR"
      ? instructorLinks
      : studentLinks;

  return (
    <aside className="w-64 bg-slate-900/70 backdrop-blur-2xl border-r border-slate-800/80 min-h-screen flex flex-col p-4 shrink-0">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-2.5 px-3 py-4 mb-6 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="text-base font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
          NEXUS<span className="text-indigo-400">LMS</span>
        </span>
      </Link>

      <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Menu {user.role}
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Public Catalog Link */}
      <div className="pt-4 border-t border-slate-800/80">
        <Link
          to="/courses"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Katalog Publik
        </Link>
      </div>
    </aside>
  );
}
