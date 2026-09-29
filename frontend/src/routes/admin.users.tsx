import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../features/users/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Pagination } from "../components/ui/Pagination";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Alert } from "../components/ui/Alert";
import { Avatar } from "../components/ui/Avatar";
import type { Role, User } from "../types";
import { formatDate } from "../lib/utils";
import { Users, Trash2, ShieldCheck, UserCheck, GraduationCap } from "lucide-react";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => usersApi.list({ page, limit }),
  });

  const users = usersRes?.data || [];
  const meta = usersRes?.meta;

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      usersApi.updateRole(id, role),
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setStatusMsg(`Role pengguna ${u.fullName} berhasil diubah menjadi ${u.role}`);
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteUserId(null);
      setStatusMsg("Pengguna berhasil dihapus.");
    },
  });

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout
        title="Manajemen Pengguna"
        subtitle="Kelola semua akun terdaftar dan hak akses peran sistem."
      >
        <div className="space-y-6">
          {statusMsg && (
            <Alert variant="success" title="Sukses">
              {statusMsg}
            </Alert>
          )}

          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat pengguna..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Peran (Role)</TableHead>
                      <TableHead>Ubah Hak Akses</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar src={u.avatar} name={u.fullName} size="sm" />
                            <span className="font-bold text-white">{u.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.role === "ADMIN"
                                ? "danger"
                                : u.role === "INSTRUCTOR"
                                ? "warning"
                                : "primary"
                            }
                            size="sm"
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <select
                            value={u.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({
                                id: u.id,
                                role: e.target.value as Role,
                              })
                            }
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="INSTRUCTOR">INSTRUCTOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            onClick={() => setDeleteUserId(u.id)}
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
            isOpen={!!deleteUserId}
            onClose={() => setDeleteUserId(null)}
            onConfirm={() => deleteUserId && deleteMutation.mutate(deleteUserId)}
            title="Hapus Pengguna"
            message="Apakah Anda yakin ingin menghapus akun pengguna ini? Seluruh data yang terkait akan terhapus secara permanen."
            confirmText="Hapus Pengguna"
            isLoading={deleteMutation.isPending}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
