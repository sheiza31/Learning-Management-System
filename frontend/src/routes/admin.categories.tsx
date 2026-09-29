import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CreateCategoryPayload } from "../features/categories/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import type { Category } from "../types";
import { FolderTree, PlusCircle, Edit, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: categoriesApi.list,
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message || "Gagal membuat kategori. Pastikan slug unik.");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateCategoryPayload>) =>
      categoriesApi.update(editingCategory!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message || "Gagal memperbarui kategori.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeleteCategoryId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setFormError("Nama dan slug kategori wajib diisi");
      return;
    }

    const payload = {
      name,
      slug,
      description: description || undefined,
    };

    if (editingCategory) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout
        title="Kategori Kursus"
        subtitle="Kelola taksonomi dan pengelompokan kursus di platform."
        actions={
          <Button size="sm" onClick={openCreateModal} leftIcon={<PlusCircle className="w-4 h-4" />}>
            Tambah Kategori
          </Button>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat kategori..." />
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <span className="font-bold text-white">{cat.name}</span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-indigo-400 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                          {cat.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-xs">
                        {cat.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5"
                            onClick={() => openEditModal(cat)}
                          >
                            <Edit className="w-4 h-4 text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            onClick={() => setDeleteCategoryId(cat.id)}
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
          )}

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
          >
            {formError && (
              <Alert variant="danger" title="Gagal" className="mb-4">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nama Kategori"
                placeholder="Contoh: Mobile Development"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />

              <Input
                label="Slug"
                placeholder="mobile-development"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  {editingCategory ? "Simpan Perubahan" : "Buat Kategori"}
                </Button>
              </div>
            </form>
          </Modal>

          <ConfirmDialog
            isOpen={!!deleteCategoryId}
            onClose={() => setDeleteCategoryId(null)}
            onConfirm={() => deleteCategoryId && deleteMutation.mutate(deleteCategoryId)}
            title="Hapus Kategori"
            message="Apakah Anda yakin ingin menghapus kategori ini?"
            confirmText="Hapus Kategori"
            isLoading={deleteMutation.isPending}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
