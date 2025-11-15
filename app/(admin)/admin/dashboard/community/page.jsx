"use client";

import {
  addCommunityMember,
  createCommunity,
  deleteCommunity,
  getCommunities,
  getCommunityMembers,
  regenerateInvite,
  removeCommunityMember,
  updateCommunity,
  uploadCommunityImage,
} from "@/services/Community";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const AdminCommunityDashboard = () => {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_public: true,
  });
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // Members modal
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [activeCommunityId, setActiveCommunityId] = useState(null);
  const memberInputRef = useRef(null);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getCommunities(1, 100);
      setCommunities(data || []);
    } catch (error) {
      console.error("Failed to fetch communities", error);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setForm({ name: "", description: "", is_public: true });
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "أدخل اسم المجتمع",
        confirmButtonText: "حسناً",
      });
      return;
    }
    try {
      await createCommunity(form);
      Swal.fire({
        icon: "success",
        title: "نجح!",
        text: "تم إنشاء المجتمع",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      setShowCreateModal(false);
      // refresh and clear preview
      setImagePreview(null);
      setSelectedImageFile(null);
      fetchList();
    } catch (error) {
      console.error("Create community error:", error);
    }
  };

  const openEdit = (community) => {
    setEditing(community);
    setForm({
      name: community.name || "",
      description: community.description || "",
      is_public: !!community.is_public,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await updateCommunity(editing.id, form);
      Swal.fire({
        icon: "success",
        title: "نجح!",
        text: "تم تحديث المجتمع",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      setShowEditModal(false);
      setEditing(null);
      // clear preview and refresh
      setImagePreview(null);
      setSelectedImageFile(null);
      fetchList();
    } catch (error) {
      console.error("Update community error:", error);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد حذف هذا المجتمع؟ لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteCommunity(id);
      Swal.fire({
        icon: "success",
        title: "تم الحذف!",
        text: "تم حذف المجتمع بنجاح",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      fetchList();
    } catch (error) {
      console.error("Delete community error:", error);
    }
  };

  const handleUploadImage = async (communityId, file) => {
    if (!file) return;
    try {
      await uploadCommunityImage(communityId, file);
      Swal.fire({
        icon: "success",
        title: "نجح!",
        text: "تم رفع صورة المجتمع",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      fetchList();
    } catch (error) {
      console.error("Upload image error:", error);
    }
  };

  const handleSelectImageForPreview = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleRegenerateInvite = async (communityId) => {
    try {
      await regenerateInvite(communityId);
      Swal.fire({
        icon: "success",
        title: "نجح!",
        text: "تم تجديد رمز الدعوة",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      fetchList();
    } catch (error) {
      console.error("Regenerate invite error:", error);
    }
  };

  const openMembers = async (communityId) => {
    setActiveCommunityId(communityId);
    setShowMembersModal(true);
    try {
      const response = await getCommunityMembers(communityId, 1, 20);
      setMembers(response.members || []);
    } catch (error) {
      console.error("Get members error:", error);
    }
  };

  const navigateToMembersPage = (communityId) => {
    router.push(`/admin/dashboard/community/${communityId}/members`);
  };

  const handleAddMember = async () => {
    const val = memberInputRef.current?.value?.trim();
    if (!val) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "أدخل معرف المستخدم أو رقم المستخدم لإضافته",
        confirmButtonText: "حسناً",
      });
      return;
    }
    try {
      await addCommunityMember(activeCommunityId, val);
      Swal.fire({
        icon: "success",
        title: "نجح!",
        text: "تمت إضافة العضو",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      memberInputRef.current.value = "";
      const response = await getCommunityMembers(activeCommunityId, 1, 20);
      setMembers(response.members || []);
    } catch (error) {
      console.error("Add member error:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد إزالة هذا العضو من المجتمع؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، أزله!",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;
    try {
      await removeCommunityMember(activeCommunityId, userId);
      Swal.fire({
        icon: "success",
        title: "تمت الإزالة!",
        text: "تمت إزالة العضو بنجاح",
        confirmButtonText: "حسناً",
        timer: 2000,
      });
      const response = await getCommunityMembers(activeCommunityId, 1, 20);
      setMembers(response.members || []);
    } catch (error) {
      console.error("Remove member error:", error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Icon
              icon="solar:users-group-two-rounded-bold"
              className="w-7 h-7 text-white"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              لوحة إدارة المجتمعات
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              إدارة وتنظيم المجتمعات
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
            إنشاء مجتمع
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 w-full max-w-xl">
            <div className="relative w-full">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="بحث في المجتمعات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
            <Icon
              icon="solar:layers-minimalistic-bold-duotone"
              className="w-5 h-5 text-sky-500"
            />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {communities.length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 dark:bg-gray-700 h-36 rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities
              .filter((c) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                  (c.name || "").toLowerCase().includes(q) ||
                  (c.description || "").toLowerCase().includes(q)
                );
              })
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon
                          icon="solar:buildings-2-bold-duotone"
                          className="w-8 h-8 text-sky-500"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {c.name}
                        </h3>
                        <div
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            c.is_public
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}
                        >
                          {c.is_public ? "عام" : "خاص"}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <Icon
                          icon="solar:ticket-bold-duotone"
                          className="w-4 h-4"
                        />
                        <span className="font-mono font-medium text-gray-700 dark:text-gray-200">
                          {c.invite_code || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleUploadImage(c.id, e.target.files[0])
                        }
                      />
                      <button
                        title="رفع صورة"
                        className="p-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                      >
                        <Icon icon="solar:camera-bold" className="w-5 h-5" />
                      </button>
                    </label>
                    <button
                      onClick={() => navigateToMembersPage(c.id)}
                      title="الأعضاء"
                      className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                    >
                      <Icon
                        icon="solar:users-group-rounded-bold"
                        className="w-5 h-5"
                      />
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      title="تعديل"
                      className="p-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-lg transition-colors"
                    >
                      <Icon icon="solar:pen-bold" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRegenerateInvite(c.id)}
                      title="تجديد رمز الدعوة"
                      className="p-2 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-lg transition-colors"
                    >
                      <Icon icon="solar:refresh-bold" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="حذف"
                      className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="w-5 h-5"
                      />
                    </button>
                    <Link href={`/admin/dashboard/community/${c.id}/view`}>
                      <button
                        title="عرض"
                        className="p-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                      >
                        <Icon icon="solar:eye-bold" className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            {communities.filter((c) => {
              if (!search.trim()) return true;
              const q = search.toLowerCase();
              return (
                (c.name || "").toLowerCase().includes(q) ||
                (c.description || "").toLowerCase().includes(q)
              );
            }).length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                لا توجد نتائج مطابقة للبحث
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Icon
                    icon="solar:add-circle-bold"
                    className="w-6 h-6 text-white"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  إنشاء مجتمع جديد
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon
                  icon="solar:close-circle-bold"
                  className="w-6 h-6 text-gray-500"
                />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المجتمع
                </label>
                <input
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="أدخل اسم المجتمع"
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <textarea
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                  placeholder="وصف المجتمع"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, is_public: e.target.checked }))
                    }
                    className="w-4 h-4"
                  />
                  <Icon
                    icon="solar:globe-bold"
                    className="w-5 h-5 text-green-500"
                  />
                  <span className="font-medium">مجتمع عام</span>
                </label>
                <div className="flex-1" />
                <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                  <Icon icon="solar:gallery-add-bold" className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleSelectImageForPreview}
                  />
                  <span className="text-sm font-medium">اختر صورة</span>
                </label>
              </div>
              {imagePreview && (
                <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                إنشاء المجتمع
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Icon icon="solar:pen-bold" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  تعديل المجتمع
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditing(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon
                  icon="solar:close-circle-bold"
                  className="w-6 h-6 text-gray-500"
                />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المجتمع
                </label>
                <input
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="أدخل اسم المجتمع"
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوصف
                </label>
                <textarea
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                  placeholder="وصف المجتمع"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, is_public: e.target.checked }))
                    }
                    className="w-4 h-4"
                  />
                  <Icon
                    icon="solar:globe-bold"
                    className="w-5 h-5 text-green-500"
                  />
                  <span className="font-medium">مجتمع عام</span>
                </label>
                <div className="flex-1" />
                <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                  <Icon icon="solar:gallery-add-bold" className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleSelectImageForPreview}
                  />
                  <span className="text-sm font-medium">تغيير الصورة</span>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                    معاينة الصورة:
                  </p>
                  <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditing(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="w-6 h-6 text-white"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  أعضاء المجتمع
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setMembers([]);
                  setActiveCommunityId(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon
                  icon="solar:close-circle-bold"
                  className="w-6 h-6 text-gray-500"
                />
              </button>
            </div>
            <div className="flex gap-2 mb-6">
              <div className="flex-1 relative">
                <Icon
                  icon="solar:user-id-bold"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  ref={memberInputRef}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="البريد الإلكتروني للعضو"
                />
              </div>
              <button
                onClick={() => handleAddMember(activeCommunityId)}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Icon icon="solar:user-plus-bold" className="w-5 h-5" />
                إضافة
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {members.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Icon
                        icon="solar:user-speak-rounded-bold-duotone"
                        className="w-10 h-10 text-gray-400"
                      />
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    لا يوجد أعضاء حتى الآن
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    ابدأ بإضافة أول عضو
                  </p>
                </div>
              )}
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 overflow-hidden flex items-center justify-center">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon
                          icon="solar:user-bold"
                          className="w-6 h-6 text-violet-500"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {m.name || m.username || "مستخدم"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Icon
                          icon="solar:letter-bold-duotone"
                          className="w-4 h-4"
                        />
                        {m.email || "لا يوجد بريد"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                  >
                    <Icon icon="solar:user-minus-bold" className="w-5 h-5" />
                    إزالة
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommunityDashboard;
