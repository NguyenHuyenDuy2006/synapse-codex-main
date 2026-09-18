"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  X,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FolderKanban,
  BarChart3,
  Users,
  Trash2,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
type TaskStatus =
  | "task"
  | "assign"
  | "doing"
  | "done"
  | "review"
  | "error";

interface TaskItem {
  id: number;
  project_id: number;
  assigned_to: number;
  assignee_name: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string;
}

interface UserItem {
  id: number;
  username: string;
}

// ─── Kanban Column Config ─────────────────────────────────────
const COLUMN_ORDER: TaskStatus[] = [
  "task",
  "assign",
  "doing",
  "done",
  "review",
  "error",
];

const COLUMNS: {
  key: TaskStatus;
  emoji: string;
  label: string;
  description: string;
  headerColor: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  cardHover: string;
  dotColor: string;
}[] = [
  {
    key: "task",
    emoji: "📋",
    label: "Task",
    description: "Chờ phân công",
    headerColor: "text-slate-300",
    badgeBg: "bg-slate-700",
    badgeText: "text-slate-300",
    cardBorder: "border-slate-700",
    cardHover: "hover:border-slate-500",
    dotColor: "bg-slate-400",
  },
  {
    key: "assign",
    emoji: "👤",
    label: "Assign",
    description: "Đã giao việc",
    headerColor: "text-blue-400",
    badgeBg: "bg-blue-500/20",
    badgeText: "text-blue-300",
    cardBorder: "border-blue-500/30",
    cardHover: "hover:border-blue-400",
    dotColor: "bg-blue-400",
  },
  {
    key: "doing",
    emoji: "⚡",
    label: "Doing",
    description: "Đang thực hiện",
    headerColor: "text-cyan-400",
    badgeBg: "bg-cyan-500/20",
    badgeText: "text-cyan-300",
    cardBorder: "border-cyan-500/30",
    cardHover: "hover:border-cyan-400",
    dotColor: "bg-cyan-400",
  },
  {
    key: "done",
    emoji: "✅",
    label: "Done",
    description: "Hoàn thành",
    headerColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-300",
    cardBorder: "border-emerald-500/30",
    cardHover: "hover:border-emerald-400",
    dotColor: "bg-emerald-400",
  },
  {
    key: "review",
    emoji: "🔍",
    label: "Review",
    description: "Đang kiểm tra",
    headerColor: "text-amber-400",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-300",
    cardBorder: "border-amber-500/30",
    cardHover: "hover:border-amber-400",
    dotColor: "bg-amber-400",
  },
  {
    key: "error",
    emoji: "❌",
    label: "Error",
    description: "Cần sửa lại",
    headerColor: "text-rose-400",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-300",
    cardBorder: "border-rose-500/30",
    cardHover: "hover:border-rose-400",
    dotColor: "bg-rose-400",
  },
];

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_USERS: UserItem[] = [
  { id: 1, username: "Nguyễn Huyền Duy" },
  { id: 2, username: "Lý Giỏi" },
];

const MOCK_TASKS: TaskItem[] = [
  {
    id: 1,
    project_id: 1,
    assigned_to: 1,
    assignee_name: "Nguyễn Huyền Duy",
    title: "Xây dựng giao diện Kanban Board",
    description:
      "Tạo layout 6 cột, task card, modal tạo task và nút chuyển trạng thái",
    status: "doing",
    due_date: "2026-09-20",
  },
  {
    id: 2,
    project_id: 1,
    assigned_to: 2,
    assignee_name: "Lý Giỏi",
    title: "Thiết kế Database & API Tasks",
    description:
      "Tạo bảng projects, tasks và viết các endpoint PHP kết nối MySQL",
    status: "assign",
    due_date: "2026-09-22",
  },
  {
    id: 3,
    project_id: 1,
    assigned_to: 1,
    assignee_name: "Nguyễn Huyền Duy",
    title: "Thiết kế Header & Footer",
    description: "Responsive navigation, footer với thông tin liên hệ",
    status: "done",
    due_date: "2026-09-15",
  },
  {
    id: 4,
    project_id: 1,
    assigned_to: 2,
    assignee_name: "Lý Giỏi",
    title: "API login.php & register.php",
    description: "Authentication với bcrypt password hashing và CORS headers",
    status: "done",
    due_date: "2026-09-14",
  },
  {
    id: 5,
    project_id: 1,
    assigned_to: 1,
    assignee_name: "Nguyễn Huyền Duy",
    title: "Trang Admin Quản lý Dịch vụ",
    description: "CRUD dịch vụ với modal thêm/sửa/xóa, toast notification",
    status: "review",
    due_date: "2026-09-18",
  },
  {
    id: 6,
    project_id: 1,
    assigned_to: 2,
    assignee_name: "Lý Giỏi",
    title: "API read.php trả dữ liệu dịch vụ",
    description:
      "Trả về JSON, hỗ trợ features dạng text và JSON array",
    status: "done",
    due_date: "2026-09-16",
  },
  {
    id: 7,
    project_id: 1,
    assigned_to: 1,
    assignee_name: "Nguyễn Huyền Duy",
    title: "Hero Section & Animations",
    description: "Banner chính với Framer Motion animations, CTA buttons",
    status: "task",
    due_date: "2026-09-25",
  },
];

// ─── Helper: Avatar initials ──────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Main Component ───────────────────────────────────────────
export default function KanbanBoardPage() {
  const params = useParams();
  const projectId = Number(params?.id ?? 1);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
  });

  // Project name — sau khi có API get_projects sẽ fetch động
  const projectName = "Xây dựng Website Synapse Codex";

  // ─── Fetch Data ─────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resTasks, resUsers] = await Promise.all([
          fetch(
            `http://localhost/synapse-codex-main/backend/get_tasks.php?project_id=${projectId}`
          ),
          fetch(`http://localhost/synapse-codex-main/backend/get_users.php`),
        ]);
        const dataTasks = await resTasks.json();
        const dataUsers = await resUsers.json();

        if (dataTasks?.status && Array.isArray(dataTasks.data)) {
          setTasks(dataTasks.data);
        } else {
          setTasks(MOCK_TASKS.filter((t) => t.project_id === projectId));
        }

        if (dataUsers?.status && Array.isArray(dataUsers.data)) {
          setUsers(dataUsers.data);
        } else {
          setUsers(MOCK_USERS);
        }
      } catch {
        // Backend chưa sẵn sàng — dùng mock data
        setTasks(MOCK_TASKS.filter((t) => t.project_id === projectId));
        setUsers(MOCK_USERS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // ─── Move Task between columns ───────────────────────────────
  const moveTask = async (taskId: number, direction: "prev" | "next") => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentIdx = COLUMN_ORDER.indexOf(task.status);
    const newIdx =
      direction === "next" ? currentIdx + 1 : currentIdx - 1;
    if (newIdx < 0 || newIdx >= COLUMN_ORDER.length) return;

    const newStatus = COLUMN_ORDER[newIdx];

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await fetch(
        "http://localhost/synapse-codex-main/backend/update_task.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: taskId, status: newStatus }),
        }
      );
    } catch {
      // silent — local state đã cập nhật
    }
  };

  // ─── Delete Task ─────────────────────────────────────────────
  const handleDelete = (taskId: number) => {
    if (!confirm("Bạn có chắc muốn xóa task này không?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    fetch(
      "http://localhost/synapse-codex-main/backend/delete_task.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      }
    ).catch(() => {});
  };

  // ─── Create Task ─────────────────────────────────────────────
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const selectedUser = users.find(
      (u) => u.id === Number(formData.assigned_to)
    );

    const newTaskPayload = {
      project_id: projectId,
      ...formData,
      status: "task",
    };

    try {
      const res = await fetch(
        "http://localhost/synapse-codex-main/backend/create_task.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTaskPayload),
        }
      );
      const data = await res.json();

      setTasks((prev) => [
        ...prev,
        {
          id: data?.id ?? Date.now(),
          project_id: projectId,
          assigned_to: Number(formData.assigned_to),
          assignee_name: selectedUser?.username ?? "Thành viên",
          title: formData.title,
          description: formData.description,
          status: "task",
          due_date: formData.due_date,
        },
      ]);
    } catch {
      // Fallback local
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          project_id: projectId,
          assigned_to: Number(formData.assigned_to),
          assignee_name: selectedUser?.username ?? "Thành viên",
          title: formData.title,
          description: formData.description,
          status: "task",
          due_date: formData.due_date,
        },
      ]);
    } finally {
      setFormData({
        title: "",
        description: "",
        assigned_to: "",
        due_date: "",
      });
      setIsModalOpen(false);
      setSubmitting(false);
    }
  };

  // ─── Stats ───────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalProgress =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const memberStats = users.map((user) => {
    const userTasks = tasks.filter((t) => t.assigned_to === user.id);
    const userDone = userTasks.filter((t) => t.status === "done").length;
    return {
      ...user,
      total: userTasks.length,
      done: userDone,
      percent:
        userTasks.length > 0
          ? Math.round((userDone / userTasks.length) * 100)
          : 0,
    };
  });

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* ── Sticky Top Bar ─────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Dự án
            </Link>
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-cyan-500" />
              <span className="font-semibold text-white text-sm">
                {projectName}
              </span>
            </div>
          </div>

          {/* Right: Progress + Add button */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Tiến độ:</span>
              <span className="font-bold text-cyan-400">{totalProgress}%</span>
              <span className="text-slate-600">
                ({doneTasks}/{totalTasks} tasks)
              </span>
            </div>
            {/* Miniature progress bar */}
            <div className="hidden sm:block w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/20"
            >
              <Plus className="h-4 w-4" />
              Thêm Task
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <p className="text-sm text-slate-400">Đang tải bảng công việc...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">

          {/* ── Kanban Board ──────────────────────────────────────── */}
          <div className="overflow-x-auto px-6 pt-6 pb-4 flex-1">
            <div className="inline-flex gap-4 min-w-max pb-2">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key);

                return (
                  <div key={col.key} className="flex flex-col w-[280px] shrink-0">

                    {/* Column Header */}
                    <div className="mb-3 px-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`}
                          />
                          <span
                            className={`font-bold text-sm ${col.headerColor}`}
                          >
                            {col.emoji} {col.label}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}
                        >
                          {colTasks.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4.5">
                        {col.description}
                      </p>
                      <div
                        className={`h-0.5 mt-2 rounded-full ${col.dotColor} opacity-30`}
                      />
                    </div>

                    {/* Task Cards */}
                    <div className="flex flex-col gap-3 min-h-[120px]">
                      {colTasks.length === 0 && (
                        <div className="border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-700 py-10">
                          Trống
                        </div>
                      )}

                      {colTasks.map((task) => {
                        const colIdx = COLUMN_ORDER.indexOf(task.status);
                        const canPrev = colIdx > 0;
                        const canNext = colIdx < COLUMN_ORDER.length - 1;
                        const initials = getInitials(task.assignee_name);
                        const isOverdue =
                          task.due_date &&
                          new Date(task.due_date) < new Date() &&
                          task.status !== "done";

                        return (
                          <div
                            key={task.id}
                            className={`rounded-xl border bg-slate-900/90 p-4 transition-all duration-200 ${col.cardBorder} ${col.cardHover} backdrop-blur-sm group/card`}
                          >
                            {/* Title */}
                            <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">
                              {task.title}
                            </h3>

                            {/* Description */}
                            {task.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                {task.description}
                              </p>
                            )}

                            {/* Assignee */}
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 ring-1 ring-slate-800">
                                {initials}
                              </div>
                              <span className="text-xs text-slate-400 truncate">
                                {task.assignee_name}
                              </span>
                            </div>

                            {/* Deadline */}
                            {task.due_date && (
                              <div
                                className={`flex items-center gap-1 text-xs mb-3 ${
                                  isOverdue
                                    ? "text-rose-400"
                                    : "text-slate-600"
                                }`}
                              >
                                {isOverdue ? (
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                ) : (
                                  <Calendar className="h-3.5 w-3.5" />
                                )}
                                <span>
                                  {isOverdue ? "Quá hạn: " : ""}
                                  {task.due_date}
                                </span>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
                              {/* Move buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveTask(task.id, "prev")}
                                  disabled={!canPrev}
                                  title={
                                    canPrev
                                      ? `Chuyển về: ${COLUMN_ORDER[colIdx - 1]}`
                                      : "Đã ở cột đầu"
                                  }
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
                                    canPrev
                                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                      : "opacity-25 cursor-not-allowed bg-slate-800/30 text-slate-600"
                                  }`}
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => moveTask(task.id, "next")}
                                  disabled={!canNext}
                                  title={
                                    canNext
                                      ? `Chuyển sang: ${COLUMN_ORDER[colIdx + 1]}`
                                      : "Đã ở cột cuối"
                                  }
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
                                    canNext
                                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                      : "opacity-25 cursor-not-allowed bg-slate-800/30 text-slate-600"
                                  }`}
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(task.id)}
                                title="Xóa task"
                                className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition opacity-0 group-hover/card:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Member Progress ───────────────────────────────────── */}
          <div className="px-6 pb-10">
            <div className="max-w-screen-2xl mx-auto border border-slate-800 rounded-2xl bg-slate-900/40 p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-5">
                <Users className="h-4 w-4 text-cyan-400" />
                Tiến độ từng thành viên
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {memberStats.map((member) => (
                  <div key={member.id} className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0 ring-2 ring-slate-900">
                      {member.username.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-slate-200 truncate">
                          {member.username}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0 ml-3">
                          <span className="text-emerald-400 font-semibold">
                            {member.done}
                          </span>
                          <span className="text-slate-600">
                            /{member.total} done
                          </span>
                          <span className="ml-2 text-cyan-400 font-bold">
                            {member.percent}%
                          </span>
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${member.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total project progress */}
                <div className="md:col-span-2 pt-4 border-t border-slate-800 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-white">
                        Tổng tiến độ dự án
                      </span>
                      <span className="text-xs shrink-0 ml-3">
                        <span className="text-emerald-400 font-semibold">
                          {doneTasks}
                        </span>
                        <span className="text-slate-600">
                          /{totalTasks} tasks
                        </span>
                        <span className="ml-2 text-cyan-400 font-bold text-sm">
                          {totalProgress}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${totalProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Task Modal ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <h3 className="text-lg font-bold text-white">
                ✚ Thêm Task mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tiêu đề Task <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết kế trang đăng nhập"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 px-3.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Assign */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Gán cho thành viên <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.assigned_to}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_to: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 px-3.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">-- Chọn thành viên --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Mô tả công việc
                </label>
                <textarea
                  rows={3}
                  placeholder="Chi tiết nội dung cần thực hiện..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 px-3.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Hạn hoàn thành (Deadline)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 px-3.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Tạo & Gán việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
