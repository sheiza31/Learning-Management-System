import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentsApi } from "../features/enrollments/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Pagination } from "../components/ui/Pagination";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { formatDate } from "../lib/utils";
import { FileCheck, Trash2, Award } from "lucide-react";

export default function AdminEnrollmentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [deleteEnrollmentId, setDeleteEnrollmentId] = useState<string | null>(null);

  const { data: enrollmentsRes, isLoading } = useQuery({
    queryKey: ["admin-enrollments-page", page],
    queryFn: () => enrollmentsApi.listAllAdmin({ page, limit }),
  });

  const enrollments = enrollmentsRes?.data || [];
  const meta = enrollmentsRes?.meta;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => enrollmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments-page"] });
      setDeleteEnrollmentId(null);
    },
  });

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout
        title="Data Pendaftaran Siswa"
        subtitle="Monitor riwayat seluruh pendaftaran kursus dan progres belajar siswa."
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat data pendaftaran..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pendaftaran</TableHead>
                      <TableHead>ID Siswa</TableHead>
                      <TableHead>Kursus</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                      <TableHead>Progres</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => {
                      const isCompleted = !!e.completedAt || (e.progress || 0) >= 100;
                      return (
                        <TableRow key={e.id}>
                          <TableCell>
                            <code className="text-xs text-slate-400 font-mono">
                              {e.id.substring(0, 8)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-white">
                              {e.studentId.substring(0, 8)}...
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-indigo-300">
                              {e.courseTitle || e.courseId.substring(0, 8)}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(e.enrolledAt)}</TableCell>
                          <TableCell>
                            <div className="w-32 space-y-1">
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>{Math.round(e.progress || 0)}%</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                                  style={{ width: `${Math.round(e.progress || 0)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isCompleted ? "success" : "primary"} size="sm">
                              {isCompleted ? "Tuntas" : "Aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              onClick={() => setDeleteEnrollmentId(e.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </div>
          )}

          <ConfirmDialog
            isOpen={!!deleteEnrollmentId}
            onClose={() => setDeleteEnrollmentId(null)}
            onConfirm={() => deleteEnrollmentId && deleteMutation.mutate(deleteEnrollmentId)}
            title="Hapus Pendaftaran"
            message="Apakah Anda yakin ingin membatalkan/menghapus pendaftaran ini? Data progres siswa pada kursus ini akan terhapus."
            confirmText="Hapus Pendaftaran"
            isLoading={deleteMutation.isPending}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
