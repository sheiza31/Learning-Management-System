import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../features/auth/AuthContext";
import type { Role } from "../../types";
import { Spinner } from "../ui/Spinner";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard
        if (user.role === "ADMIN") navigate("/admin");
        else if (user.role === "INSTRUCTOR") navigate("/instructor");
        else navigate("/student");
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" label="Memuat akun..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
