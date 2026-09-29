import React, { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { authApi } from "../features/auth/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { User, Mail, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setErrorMsg("Nama lengkap tidak boleh kosong");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const updated = await authApi.updateProfile({
        fullName,
        avatar: avatar || undefined,
      });
      updateUser(updated);
      setSuccessMsg("Profil berhasil diperbarui!");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui profil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "INSTRUCTOR"]}>
      <DashboardLayout
        title="Profil Saya"
        subtitle="Kelola informasi akun dan preferensi identitas Anda."
      >
        <div className="max-w-2xl space-y-6">
          {successMsg && (
            <Alert variant="success" title="Berhasil">
              {successMsg}
            </Alert>
          )}
          {errorMsg && (
            <Alert variant="danger" title="Gagal">
              {errorMsg}
            </Alert>
          )}

          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
              <Avatar src={avatar || user?.avatar} name={fullName} size="xl" />
              <div>
                <h3 className="text-lg font-bold text-white">{fullName}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <Badge variant="primary" size="sm" className="mt-1.5">
                  Role: {user?.role}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email (Hanya Baca)"
                type="email"
                value={user?.email || ""}
                disabled
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Email digunakan sebagai identitas login utama Anda."
              />

              <Input
                label="URL Avatar / Foto Profil (Opsional)"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://pin.it/... atau https://drive.google.com/..."
                helperText="Mendukung link Pinterest (pin.it), Google Drive, Google Images, Unsplash, Imgur, atau file .jpg/.png."
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Simpan Perubahan
              </Button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
