import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../features/auth/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { GraduationCap, Mail, Lock, Sparkles, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const user = await login({ email, password });
      // Redirect based on role
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "INSTRUCTOR") navigate("/instructor");
      else navigate("/student");
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa kembali email dan kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Masuk ke Akun Anda
        </h2>
        <p className="text-xs text-slate-400">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Daftar sekarang gratis
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <Alert variant="danger" title="Gagal Masuk">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Masuk Sekarang
            </Button>
          </form>

          {/* Quick Fill Demo Accounts */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Akun Demo Siap Pakai:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@lms.test")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all text-[11px] group"
              >
                <div className="font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </div>
                <div className="text-[9px] text-slate-500 truncate">admin@lms.test</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("budi@lms.test")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all text-[11px] group"
              >
                <div className="font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1">
                  <User className="w-3 h-3" /> Instruktur
                </div>
                <div className="text-[9px] text-slate-500 truncate">budi@lms.test</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("siti@lms.test")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all text-[11px] group"
              >
                <div className="font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Siswa
                </div>
                <div className="text-[9px] text-slate-500 truncate">siti@lms.test</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
