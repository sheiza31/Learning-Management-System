import React from "react";
import { useQuery } from "@tanstack/react-query";
import { enrollmentsApi } from "../features/enrollments/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { formatDate } from "../lib/utils";
import { Users } from "lucide-react";

export default function InstructorStudentsPage() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["instructor-students"],
    queryFn: () => enrollmentsApi.listByInstructor(),
  });

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
      <DashboardLayout
        title="Siswa Terdaftar"
        subtitle="Pantau aktivitas dan progres belajar seluruh siswa di kursus Anda."
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat data siswa..." />
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8 text-slate-500" />}
              title="Belum Ada Siswa Terdaftar"
              description="Siswa yang mendaftar ke kursus Anda akan otomatis tercantum di halaman ini."
            />
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kursus</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Progres Belajar</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((e) => {
                    const isCompleted =
                      !!e.completedAt || (e.progress || 0) >= 100;
                    return (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="font-semibold text-white">
                            {e.studentName || `ID: ${e.studentId.substring(0, 8)}...`}
                          </div>
                          {e.studentEmail && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {e.studentEmail}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-indigo-300">
                            {e.courseTitle || "Kursus"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(e.enrolledAt)}</TableCell>
                        <TableCell>
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>{Math.round(e.progress || 0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                                style={{
                                  width: `${Math.round(e.progress || 0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isCompleted ? "success" : "primary"}
                            size="sm"
                          >
                            {isCompleted ? "Selesai" : "Belajar"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
