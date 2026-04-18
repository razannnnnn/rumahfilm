"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "@/components/Sidebar";

const EXT_COLORS = {
  ".mkv": { bg: "#E6F1FB", color: "#185FA5" },
  ".mp4": { bg: "#EAF3DE", color: "#3B6D11" },
  ".srt": { bg: "#FAEEDA", color: "#854F0B" },
  ".vtt": { bg: "#FAEEDA", color: "#854F0B" },
  ".avi": { bg: "#FBEAF0", color: "#993556" },
  ".mov": { bg: "#EEEDFE", color: "#534AB7" },
};

function Badge({ ext }) {
  const style = EXT_COLORS[ext] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{
      fontSize: "10px", fontWeight: 500, padding: "2px 6px",
      borderRadius: "4px", background: style.bg, color: style.color, marginLeft: "6px"
    }}>
      {ext.replace(".", "").toUpperCase()}
    </span>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-xl"
        style={{ minWidth: "320px" }}
      >
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-5">{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-xs px-4 py-2 rounded-lg border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="text-xs px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            Hapus
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ExplorerPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null); // { names: [] }
  const [deletingNames, setDeletingNames] = useState([]); // loading state per row
  const fileInputRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/explorer");
      const { files } = await res.json();
      setFiles(files);
    } catch {
      showToast("Gagal memuat file", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((f) => f.name));
  };

  // Delete — pakai confirm dialog, bukan browser confirm()
  const handleDeleteConfirm = (names) => {
    setConfirm({ names });
  };

  const handleDeleteExecute = async () => {
    const names = confirm.names;
    setConfirm(null);
    setDeletingNames(names);
    try {
      const res = await fetch("/api/explorer/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${data.deleted} file dihapus`);
        setSelected([]);
        fetchFiles();
      } else {
        showToast(data.error || "Gagal menghapus", "error");
      }
    } catch {
      showToast("Gagal menghapus file", "error");
    } finally {
      setDeletingNames([]);
    }
  };

  // Rename
  const handleRename = async (oldName) => {
    if (!renameValue.trim() || renameValue === oldName) {
      setRenaming(null);
      return;
    }
    try {
      const res = await fetch("/api/explorer/rename", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: renameValue.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("File berhasil direname");
        setRenaming(null);
        fetchFiles();
      } else {
        showToast(data.error || "Gagal rename", "error");
      }
    } catch {
      showToast("Gagal rename file", "error");
    }
  };

  // Upload pakai XHR untuk progress
  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append("files", f));

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      fileInputRef.current.value = "";
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          showToast(`${data.uploaded.length} file berhasil diupload`);
          fetchFiles();
        } else {
          showToast(data.error || "Upload gagal", "error");
        }
      } catch {
        showToast("Upload gagal", "error");
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      showToast("Upload gagal", "error");
    };
    xhr.open("POST", "/api/explorer/upload");
    xhr.send(formData);
  };

  // Download — trigger langsung lewat link
  const handleDownload = (name) => {
    const a = document.createElement("a");
    a.href = `/api/explorer/download?filePath=${encodeURIComponent(name)}`;
    a.download = name;
    a.click();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }} className="px-4 md:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">File Explorer</h1>
            <p className="text-xs text-gray-400 mt-1 font-mono">/mnt/harddisk/Film</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Cari file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#86efac]/50 transition-colors"
              style={{ width: "180px" }}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac]/25 text-[#16a34a] dark:text-[#86efac] border border-[#86efac]/40 transition-colors disabled:opacity-50"
            >
              {uploading ? `Mengupload ${uploadProgress}%` : "+ Upload"}
            </button>
            {selected.length > 0 && (
              <button
                onClick={() => handleDeleteConfirm(selected)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-400/10 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/20 transition-colors"
              >
                Hapus ({selected.length})
              </button>
            )}
          </div>
        </div>

        {/* Upload progress bar */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5"
              style={{ height: "4px" }}
            >
              <motion.div
                animate={{ width: `${uploadProgress}%` }}
                className="h-full rounded-full bg-[#86efac]"
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1c1c1f]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-[#18181b]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="accent-[#86efac]"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Nama File</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 hidden md:table-cell">Ukuran</th>
                <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center text-sm text-gray-400 py-12">
                    Memuat file...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-sm text-gray-400 py-12">
                    {search ? "File tidak ditemukan" : "Tidak ada file"}
                  </td>
                </tr>
              ) : (
                filtered.map((file, i) => {
                  const isDeleting = deletingNames.includes(file.name);
                  return (
                    <motion.tr
                      key={file.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isDeleting ? 0.4 : 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-b border-gray-100 dark:border-white/[0.04] last:border-0 transition-colors ${
                        selected.includes(file.name)
                          ? "bg-[#86efac]/5"
                          : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="accent-[#86efac]"
                          checked={selected.includes(file.name)}
                          onChange={() => toggleSelect(file.name)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {renaming === file.name ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRename(file.name)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(file.name);
                              if (e.key === "Escape") setRenaming(null);
                            }}
                            className="text-sm px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 border border-[#86efac]/40 text-gray-900 dark:text-gray-100 focus:outline-none w-full max-w-sm"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 dark:text-gray-100 break-all">
                              {file.name}
                            </span>
                            <Badge ext={file.ext} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-400 font-mono">{file.size}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setRenaming(file.name); setRenameValue(file.name); }}
                            disabled={isDeleting}
                            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/[0.06] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 transition-colors disabled:opacity-40"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => handleDownload(file.name)}
                            disabled={isDeleting}
                            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/[0.06] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 transition-colors disabled:opacity-40"
                          >
                            Unduh
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm([file.name])}
                            disabled={isDeleting}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-400/20 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors disabled:opacity-40"
                          >
                            {isDeleting ? "Menghapus..." : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {filtered.length} file{search && ` ditemukan`} · {files.length} total
        </p>

        {/* Confirm Dialog */}
        <AnimatePresence>
          {confirm && (
            <ConfirmDialog
              message={`Hapus ${confirm.names.length} file? Tindakan ini tidak bisa dibatalkan.`}
              onConfirm={handleDeleteExecute}
              onCancel={() => setConfirm(null)}
            />
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border ${
                toast.type === "error"
                  ? "bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-400/20"
                  : "bg-[#86efac]/10 text-[#16a34a] dark:text-[#86efac] border-[#86efac]/30"
              }`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}