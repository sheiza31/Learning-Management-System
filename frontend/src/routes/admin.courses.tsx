import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Pagination } from "../components/ui/Pagination";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { formatPrice } from "../lib/utils";
import { BookOpen, Trash2, Edit, ExternalLink, Sparkles } from "lucide-react";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["admin-courses", page],
    queryFn: () => coursesApi.list({ page, limit, status: "" }),
  });

  const courses = coursesRes?.data || [];
  const meta = coursesRes?.meta;

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "published" | "archived" }) =>
      coursesApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setDeleteCourseId(null);
    },
  });

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout
        title="Manajemen Seluruh Kursus"
        subtitle="Monitor, atur status visibilitas publik, atau hapus kursus di platform."
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat kursus..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kursus</TableHead>
                      <TableHead>Instruktur</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div>
                            <span className="font-bold text-white block">{c.title}</span>
                            <span className="text-xs text-slate-500 font-mono">/{c.slug}</span>
                          </div>
                        </TableCell>
                        <TableCell>{c.instructorName || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">
                            {c.categoryName || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(c.price)}</TableCell>
                        <TableCell>
                          <select
                            value={c.status}
                            onChange={(e) =>
                              toggleStatusMutation.mutate({
                                id: c.id,
                                status: e.target.value as any,
                              })
                            }
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="draft">draft</option>
                            <option value="published">published</option>
                            <option value="archived">archived</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/courses/${c.slug || c.id}`} target="_blank">
                              <Button variant="ghost" size="sm" className="p-1.5" title="Buka Halaman Kursus">
                                <ExternalLink className="w-4 h-4 text-slate-400" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              onClick={() => setDeleteCourseId(c.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
            isOpen={!!deleteCourseId}
            onClose={() => setDeleteCourseId(null)}
            onConfirm={() => deleteCourseId && deleteMutation.mutate(deleteCourseId)}
            title="Hapus Kursus"
            message="Apakah Anda yakin ingin menghapus kursus ini beserta seluruh materi di dalamnya?"
            confirmText="Hapus Kursus"
            isLoading={deleteMutation.isPending}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
