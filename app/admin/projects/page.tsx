"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  Users,
  CheckCircle2,
  X,
  Loader2,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Layers,
  LayoutGrid,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  taskTotal: number;
  taskDone: number;
  members: string[];
  created_at: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Xây dựng Website Synapse Codex",
    description:
      "Landing page, hệ thống quản trị, xác thực người dùng và quản lý dịch vụ cho công ty Synapse Codex.",
    taskTotal: 7,
    taskDone: 3,
    members: ["Nguyễn Huyền Duy", "Lý Giỏi"],
    created_at: "2026-09-14",
  },
];

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(
        "http://localhost/synapse-codex-main/backend/create_project.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.status) {
        setProjects((prev) => [
          ...prev,
          {
            id: data.id || Date.now(),
            name: formData.name,
            description: formData.description,
            taskTotal: 0,
            taskDone: 0,
            members: [],
            created_at: new Date().toISOString().split("T")[0],
          },
        ]);
        setFormData({ name: "", description: "" });
        setIsModalOpen(false);
      }
    } catch {
      // Fallback: cập nhật local state khi backend chưa sẵn sàng
      setProjects((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: formData.name,
          description: formData.description,
          taskTotal: 0,
          taskDone: 0,
          members: [],
          created_at: new Date().toISOString().split("T")[0],
        },
      ]);
      setFormData({ name: "", description: "" });
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Trang chủ
              </Link>
              <span className="text-slate-700">/</span>
              <Link
                href="/admin/services"
                className="text-sm text-slate-500 hover:text-slate-300 transition"
              >
                Quản lý Dịch vụ
              </Link>
              <span className="text-slate-700">/</span>
              <span className="text-sm text-cyan-400">Dự án</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Quản lý Dự án
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Theo dõi tiến độ và phân công công việc theo từng dự án
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 font-medium text-white transition hover:bg-cyan-500 shadow-lg shadow-cyan-600/20 shrink-0"
          >
            <Plus className="h-5 w-5" /> Tạo dự án mới
          </button>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl">
            <FolderKanban className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Chưa có dự án nào.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-cyan-400 hover:underline font-medium"
            >
              + Tạo dự án đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const progress =
                project.taskTotal > 0
                  ? Math.round((project.taskDone / project.taskTotal) * 100)
                  : 0;

              return (
                <div
                  key={project.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-slate-600 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-900/10 group"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition">
                        <FolderKanban className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-500 mt-1 shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.created_at}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition leading-snug">
                      {project.name}
                    </h2>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-5">
                      {project.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs mb-4">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Layers className="h-3.5 w-3.5" />
                        {project.taskTotal} tasks
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {project.taskDone} done
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Users className="h-3.5 w-3.5" />
                        {project.members.length} thành viên
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" /> Tiến độ
                        </span>
                        <span className="text-cyan-400 font-semibold">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Members */}
                    {project.members.length > 0 && (
                      <div className="flex items-center gap-2 mb-5">
                        {project.members.map((name, i) => (
                          <div
                            key={i}
                            className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900"
                            title={name}
                          >
                            {name.charAt(0)}
                          </div>
                        ))}
                        <span className="text-xs text-slate-500 ml-1">
                          {project.members.join(" & ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-300 hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Xem Kanban Board
                  </Link>
                </div>
              );
            })}

            {/* Add Project Card */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 min-h-[280px] transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-800 group-hover:bg-cyan-500/10 flex items-center justify-center mb-3 transition">
                <Plus className="h-6 w-6 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
              <span className="text-sm text-slate-500 group-hover:text-cyan-400 font-medium transition">
                Tạo dự án mới
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <h3 className="text-lg font-bold text-white">Tạo dự án mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tên dự án <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Website Synapse Codex"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 px-3.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Mô tả dự án
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả ngắn về mục tiêu dự án..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 px-3.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Tạo dự án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}