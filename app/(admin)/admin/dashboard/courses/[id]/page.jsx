"use client";

import Switcher from "@/components/ui/Switcher";
import {
    getCourse,
    updateCourse,
    uploadCourseImage,
} from "@/services/admin/Course";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const AdminCourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    price_before_discount: 0,
    is_free: false,
    is_pinned: false,
    sellable: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const discountPercent = useMemo(() => {
    if (
      Number(editForm.price_before_discount) > 0 &&
      Number(editForm.price_before_discount) > Number(editForm.price)
    ) {
      const percent =
        100 -
        (Number(editForm.price) / Number(editForm.price_before_discount)) * 100;
      return Math.round(percent);
    }
    return 0;
  }, [editForm.price, editForm.price_before_discount]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getCourse(courseId);
        setCourse(data);
        setEditForm({
          name: data?.name || "",
          description: data?.description || "",
          price: data?.price || 0,
          price_before_discount: data?.price_before_discount || 0,
          is_free: Boolean(data?.is_free),
          is_pinned: Boolean(data?.is_pinned),
          sellable: Boolean(data?.sellable),
        });
        setImagePreview(
          data?.image
            ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${data.image}`
            : ""
        );
      } catch (e) {
        setError("فشل تحميل بيانات الدورة");
        console.error(e);
        toast.error("فشل تحميل بيانات الدورة");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result?.toString() || "");
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!courseId) return;
    setSaving(true);
    setError("");
    try {
      await updateCourse(courseId, editForm);
      if (imageFile) {
        await uploadCourseImage(courseId, imageFile);
        toast.success("تم تحديث الصورة بنجاح");
      }
      // Refetch to sync UI state
      const data = await getCourse(courseId);
      setCourse(data);
      setImagePreview(
        data?.image
          ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${data.image}`
          : ""
      );
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (e) {
      console.error(e);
      setError("فشل حفظ التغييرات");
      toast.error("فشل حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            جاري تحميل الدورة...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="solar:danger-circle-bold"
              className="w-10 h-10 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            خطأ في التحميل
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-500/20"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white dark:bg-gray-800 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <Icon
                icon="solar:arrow-right-bold"
                className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  تعديل الدورة
                </h1>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium border border-gray-200 dark:border-gray-600">
                  #{course?.id}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                إدارة تفاصيل ومحتوى الدورة التدريبية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/dashboard/courses/${courseId}/lectures`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
            >
              <Icon icon="solar:book-bold" className="w-5 h-5" />
              المحاضرات
            </Link>
            <button
              onClick={handleSave}
              disabled={!editForm.name.trim() || saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                  <span>حفظ التغييرات</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="solar:document-text-bold"
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    المعلومات الأساسية
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    تفاصيل الدورة وعنوانها
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    اسم الدورة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                    placeholder="أدخل اسم الدورة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    وصف الدورة
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 resize-none"
                    placeholder="اكتب وصفاً مفصلاً للدورة..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-left dir-ltr">
                    {editForm.description.length} / 500
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                  <Icon
                    icon="solar:wallet-bold"
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    تسعير الدورة
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    تحديد تكلفة الانضمام للدورة
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      السعر الحالي ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          handleChange("price", Number(e.target.value))
                        }
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      السعر قبل الخصم ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        value={editForm.price_before_discount}
                        onChange={(e) =>
                          handleChange(
                            "price_before_discount",
                            Number(e.target.value)
                          )
                        }
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center shadow-sm">
                        <Icon
                          icon="solar:discount-bold"
                          className="w-6 h-6 text-green-600 dark:text-green-400"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 dark:text-green-300">
                          خصم مميز!
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                          نسبة الخصم الحالية:{" "}
                          <span className="font-bold text-lg">
                            {discountPercent}%
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                صورة الدورة
              </h3>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700/50 border-2 border-dashed border-gray-200 dark:border-gray-600 group-hover:border-blue-500/50 transition-all duration-300">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Course preview"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <label
                            htmlFor="course-image"
                            className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-xl cursor-pointer transition-all transform hover:scale-110"
                          >
                            <Icon icon="solar:pen-bold" className="w-6 h-6" />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label
                        htmlFor="course-image"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6"
                      >
                        <div className="w-16 h-16 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                          <Icon
                            icon="solar:gallery-add-bold"
                            className="w-8 h-8 text-gray-400 dark:text-gray-300"
                          />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          اضغط لرفع صورة
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          PNG, JPG حتى 5MB
                        </p>
                      </label>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="course-image"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                إعدادات الدورة
              </h3>
              <div className="space-y-4">
                {/* Sellable */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Icon
                        icon="solar:cart-bold"
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        قابل للبيع
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        إتاحة الشراء
                      </p>
                    </div>
                  </div>
                  <Switcher
                    checked={editForm.sellable}
                    onChange={(checked) => handleChange("sellable", checked)}
                    color="green"
                  />
                </div>

                {/* Free */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Icon
                        icon="solar:gift-bold"
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        مجانية
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        بدون تكلفة
                      </p>
                    </div>
                  </div>
                  <Switcher
                    checked={editForm.is_free}
                    onChange={(checked) => handleChange("is_free", checked)}
                    color="blue"
                  />
                </div>

                {/* Pinned */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Icon
                        icon="solar:pin-bold"
                        className="w-4 h-4 text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        مثبتة
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        في الأعلى
                      </p>
                    </div>
                  </div>
                  <Switcher
                    checked={editForm.is_pinned}
                    onChange={(checked) => handleChange("is_pinned", checked)}
                    color="purple"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDetailPage;
