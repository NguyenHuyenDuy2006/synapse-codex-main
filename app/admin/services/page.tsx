"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Code,
  Users,
  RefreshCw
} from "lucide-react";

interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[] | string | null;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal (Popup Form)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "code",
    features: "",
  });

  // 1. Tải danh sách dịch vụ từ backend
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost/synapse-codex-main/backend/read.php");
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      showNotify("error", "Không thể kết nối đến máy chủ Backend.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Thông báo toast
  const showNotify = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  // 2. Mở Modal Thêm mới
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ title: "", description: "", icon: "code", features: "" });
    setIsModalOpen(true);
  };

  // 3. Mở Modal Chỉnh sửa
  const handleOpenEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      icon: item.icon,
      features: Array.isArray(item.features)
        ? item.features.join("\n")
        : item.features ?? "",
    });
    setIsModalOpen(true);
  };

  // 4. Đóng Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // 5. Xử lý Thêm / Sửa khi Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Vui lòng điền đầy đủ Tiêu đề và Mô tả!");
      return;
    }

    setSubmitting(true);
    const isEdit = !!editingItem;
    const url = isEdit
      ? "http://localhost/synapse-codex-main/backend/update_service.php"
      : "http://localhost/synapse-codex-main/backend/create_service.php";

    const payload = isEdit ? { id: editingItem.id, ...formData } : formData;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status) {
        showNotify("success", isEdit ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ mới thành công!");
        handleCloseModal();
        fetchServices();
      } else {
        showNotify("error", data.message || "Thao tác thất bại.");
      }
    } catch (err) {
      showNotify("error", "Lỗi gửi dữ liệu đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Xử lý Xóa dịch vụ
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${title}" không?`)) {
      return;
    }

    try {
      const res = await fetch("http://localhost/synapse-codex-main/backend/delete_service.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.status) {
        showNotify("success", "Đã xóa dịch vụ thành công!");
        fetchServices();
      } else {
        showNotify("error", data.message || "Không thể xóa dịch vụ.");
      }
    } catch (err) {
      showNotify("error", "Lỗi kết nối khi xóa.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Trang chủ
              </Link>
              <span className="text-slate-700">/</span>
              <Link
                href="/admin/projects"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition"
              >
                Quản lý Dự án
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Quản lý Dịch vụ</h1>
            <p className="text-sm text-slate-400 mt-1">
              Thêm, chỉnh sửa hoặc xóa các dịch vụ hiển thị ngoài trang chủ
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 font-medium text-white transition hover:bg-cyan-500 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="h-5 w-5" /> Thêm dịch vụ mới
          </button>
        </div>

        {notification && (
          <div
            className={`flex items-center gap-3 p-4 mb-6 rounded-xl border ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-2" />
              <p>Đang tải dữ liệu dịch vụ...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p>Chưa có dịch vụ nào trong cơ sở dữ liệu.</p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 text-cyan-400 hover:underline font-medium"
              >
                + Bấm vào đây để thêm dịch vụ đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Icon</th>
                    <th className="py-4 px-6">Tiêu đề</th>
                    <th className="py-4 px-6">Mô tả</th>
                    <th className="py-4 px-6">Tính năng (Features)</th>
                    <th className="py-4 px-6 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {services.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-mono text-slate-400">#{item.id}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                          {item.icon === "users" ? (
                            <Users className="h-4 w-4" />
                          ) : item.icon === "refresh-cw" ? (
                            <RefreshCw className="h-4 w-4" />
                          ) : (
                            <Code className="h-4 w-4" />
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-white whitespace-nowrap">
                        {item.title}
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate text-slate-400">
                        {item.description}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
                          {Array.isArray(item.features)
                            ? `${item.features.length} tính năng`
                            : typeof item.features === "string" && item.features.trim() !== ""
                            ? `${item.features.split("\n").filter(Boolean).length} tính năng`
                            : "0 tính năng"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 transition"
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tiêu đề dịch vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phát triển Web & App"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 px-3.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Biểu tượng (Icon)
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 px-3.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="code">Lập trình (Code)</option>
                  <option value="users">Khách hàng / Doanh nghiệp (Users)</option>
                  <option value="refresh-cw">Hạ tầng / Vận hành (Refresh)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Mô tả ngắn <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tóm tắt ngắn gọn nội dung dịch vụ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 px-3.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Danh sách tính năng đi kèm
                </label>
                <p className="text-xs text-slate-500 mb-1">
                  * Nhập mỗi tính năng trên một dòng riêng biệt.
                </p>
                <textarea
                  rows={4}
                  placeholder={"Thiết kế UI/UX hiện đại\nTối ưu chuẩn SEO\nBảo mật cao"}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 px-3.5 font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingItem ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}