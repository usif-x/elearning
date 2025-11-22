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
        setImagePreview(data?.image_url || "");
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
      setImagePreview(data?.image_url || "");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            جاري تحميل الدورة...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="solar:danger-circle-bold"
              className="w-8 h-8 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            خطأ في التحميل
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                aria-label="رجوع"
              >
                <Icon
                  icon="solar:arrow-right-outline"
                  className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    تعديل الدورة
                  </h1>
                  {course?.id && (
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                      #{course.id}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  إدارة ومراقبة تفاصيل الدورة التدريبية
                </p>
                <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Link
                    href="/admin/dashboard/courses"
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    الدورات
                  </Link>
                  <Icon
                    icon="solar:alt-arrow-left-bold"
                    className="w-4 h-4 mx-2"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {editForm.name || "بدون اسم"}
                  </span>
                </nav>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    editForm.sellable
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <Icon icon="solar:cart-bold" className="w-3 h-3" />
                  قابل للبيع
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    editForm.is_free
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <Icon icon="solar:gift-bold" className="w-3 h-3" />
                  مجانية
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    editForm.is_pinned
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <Icon icon="solar:pin-bold" className="w-3 h-3" />
                  مثبتة
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href={`/admin/dashboard/courses/${courseId}/lectures`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Icon icon="solar:book-bold" className="w-5 h-5" />
                  المحاضرات
                </Link>

                <Link
                  href="/admin/dashboard/courses/manage"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                  إضافة دورة
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Image Upload */}
        <div className="md:col-span-1">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Icon
                  icon="solar:camera-bold"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  صورة الدورة
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  المقاس الموصى به: 630×1200 بكسل
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="aspect-[4/5] max-w-[200px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-300 group-hover:border-blue-400 dark:group-hover:border-blue-500">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Course preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-3">
                        <Icon
                          icon="solar:gallery-edit-bold"
                          className="w-6 h-6 text-gray-700 dark:text-gray-300"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="solar:image-outline"
                        className="w-8 h-8 text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      لا توجد صورة
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      اسحب وأفلت الصورة هنا أو انقر للاختيار
                    </p>
                  </div>
                )}
              </div>

              <label className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group/btn">
                <Icon
                  icon="solar:upload-bold"
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover/btn:text-blue-700"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/btn:text-gray-900 dark:group-hover/btn:text-white">
                  {imagePreview ? "تغيير الصورة" : "اختيار صورة"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            </div>

            {imageFile && (
              <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    تم اختيار الصورة: {imageFile.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="md:col-span-2">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
            {/* Course Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon
                  icon="solar:text-bold"
                  className="w-4 h-4 text-blue-500"
                />
                اسم الدورة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="أدخل اسم الدورة التدريبية"
              />
              {!editForm.name && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <Icon icon="solar:danger-triangle-bold" className="w-3 h-3" />
                  اسم الدورة مطلوب
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon
                  icon="solar:document-text-bold"
                  className="w-4 h-4 text-green-500"
                />
                وصف الدورة
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                placeholder="اكتب وصفاً مفصلاً للدورة التدريبية..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {editForm.description.length}/500 حرف
              </p>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Icon
                  icon="solar:dollar-bold"
                  className="w-5 h-5 text-yellow-500"
                />
                التسعير
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Icon
                      icon="solar:tag-price-bold"
                      className="w-4 h-4 text-blue-500"
                    />
                    السعر الحالي
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        handleChange("price", Number(e.target.value))
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      $
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Icon
                      icon="solar:tag-price-bold"
                      className="w-4 h-4 text-orange-500"
                    />
                    السعر قبل الخصم
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editForm.price_before_discount}
                      onChange={(e) =>
                        handleChange(
                          "price_before_discount",
                          Number(e.target.value)
                        )
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      $
                    </span>
                  </div>
                </div>
              </div>

              {editForm.price_before_discount > 0 &&
                editForm.price >= editForm.price_before_discount && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <Icon
                      icon="solar:danger-triangle-bold"
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                    />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      يجب أن يكون السعر قبل الخصم أكبر من السعر الحالي
                    </p>
                  </div>
                )}

              {discountPercent > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="solar:discount-bold"
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      خصم مميز!
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      نسبة الخصم الحالية:{" "}
                      <span className="font-bold">{discountPercent}%</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Icon
                  icon="solar:settings-bold"
                  className="w-5 h-5 text-purple-500"
                />
                إعدادات الدورة
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <Icon
                          icon="solar:cart-bold"
                          className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-800 dark:text-emerald-300">
                          قابل للبيع
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          يمكن شراء الدورة
                        </p>
                      </div>
                    </div>
                    <Switcher
                      checked={editForm.sellable}
                      onChange={(checked) => handleChange("sellable", checked)}
                      color="emerald"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Icon
                          icon="solar:gift-bold"
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">
                          مجانية
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          متاحة بدون تكلفة
                        </p>
                      </div>
                    </div>
                    <Switcher
                      checked={editForm.is_free}
                      onChange={(checked) => handleChange("is_free", checked)}
                      color="blue"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Icon
                          icon="solar:pin-bold"
                          className="w-5 h-5 text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-purple-800 dark:text-purple-300">
                          مثبتة
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          تظهر في الأعلى
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={!editForm.name.trim() || saving}
                className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-5 h-5"
                      />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </div>
              </button>

              <button
                onClick={() => router.push("/admin/dashboard/courses")}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
                  <span>إلغاء</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Course Details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Icon
              icon="solar:info-circle-bold"
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            تفاصيل الدورة
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:hashtag-bold"
                  className="w-4 h-4 text-slate-600 dark:text-slate-400"
                />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                المعرف
              </span>
            </div>
            <p className="font-mono text-lg text-slate-900 dark:text-slate-100">
              {course?.id}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:cart-bold"
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                قابل للبيع
              </span>
            </div>
            <p
              className={`font-semibold text-lg ${
                editForm.sellable
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {editForm.sellable ? "نعم" : "لا"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:gift-bold"
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
              </div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                مجانية
              </span>
            </div>
            <p
              className={`font-semibold text-lg ${
                editForm.is_free
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {editForm.is_free ? "نعم" : "لا"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:pin-bold"
                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                />
              </div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                مثبتة
              </span>
            </div>
            <p
              className={`font-semibold text-lg ${
                editForm.is_pinned
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {editForm.is_pinned ? "نعم" : "لا"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:dollar-bold"
                  className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                السعر الحالي
              </span>
            </div>
            <p className="font-bold text-xl text-yellow-800 dark:text-yellow-300">
              ${editForm.price || 0}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:tag-price-bold"
                  className="w-4 h-4 text-orange-600 dark:text-orange-400"
                />
              </div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                السعر قبل الخصم
              </span>
            </div>
            <p className="font-bold text-xl text-orange-800 dark:text-orange-300">
              ${editForm.price_before_discount || 0}
            </p>
          </div>
        </div>

        {discountPercent > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-300 dark:border-emerald-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/50 dark:bg-black/20 rounded-xl flex items-center justify-center">
                  <Icon
                    icon="solar:discount-bold"
                    className="w-6 h-6 text-emerald-700 dark:text-emerald-300"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">
                    عرض خاص!
                  </h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    خصم على هذه الدورة
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  {discountPercent}%
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  نسبة الخصم
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseDetailPage;
