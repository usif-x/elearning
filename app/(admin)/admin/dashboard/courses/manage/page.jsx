"use client";

import { createCourse, uploadCourseImage } from "@/services/admin/Course";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const CreateCoursePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    price_before_discount: 0,
    is_free: false,
    is_pinned: false,
    sellable: true,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setSelectedImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم الدورة");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("يرجى إدخال وصف الدورة");
      return;
    }

    if (!formData.is_free && formData.price <= 0) {
      toast.error("يرجى إدخال سعر صحيح للدورة أو تحديدها كدورة مجانية");
      return;
    }

    setLoading(true);
    try {
      // Create the course
      const courseData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.is_free ? 0 : formData.price,
        price_before_discount: formData.price_before_discount || 0,
        is_free: formData.is_free,
        is_pinned: formData.is_pinned,
        sellable: formData.sellable,
      };

      const response = await createCourse(courseData);

      // Upload image if selected
      if (selectedImageFile && response.id) {
        try {
          await uploadCourseImage(response.id, selectedImageFile);
        } catch (imageError) {
          console.error("Error uploading course image:", imageError);
          toast.warning("تم إنشاء الدورة بنجاح ولكن فشل رفع الصورة");
        }
      }

      toast.success("تم إنشاء الدورة بنجاح!");
      router.push("/admin/dashboard/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("حدث خطأ أثناء إنشاء الدورة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-600 rounded-2xl shadow-lg">
              <Icon
                icon="solar:add-circle-bold-duotone"
                className="w-12 h-12 text-white"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                إنشاء دورة جديدة
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                أضف دورة تدريبية جديدة إلى المنصة
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                <Icon
                  icon="solar:document-text-bold"
                  className="w-8 h-8 text-blue-500"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                المعلومات الأساسية
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  اسم الدورة *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="أدخل اسم الدورة التدريبية"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  وصف الدورة *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="اكتب وصفاً مفصلاً للدورة التدريبية..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                <Icon
                  icon="solar:wallet-bold"
                  className="w-8 h-8 text-green-500"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                التسعير
              </h2>
            </div>

            <div className="space-y-6">
              {/* Free Course Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="solar:gift-bold"
                    className="w-6 h-6 text-blue-600"
                  />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      دورة مجانية
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      متاحة بدون دفع لجميع الطلاب
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("is_free", !formData.is_free)
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    formData.is_free
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      formData.is_free ? "right-1" : "right-8"
                    }`}
                  />
                </button>
              </div>

              {/* Price Fields - Only show if not free */}
              {!formData.is_free && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      السعر الحالي ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      السعر قبل الخصم ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_before_discount}
                      onChange={(e) =>
                        handleInputChange(
                          "price_before_discount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                <Icon
                  icon="solar:settings-bold"
                  className="w-8 h-8 text-purple-500"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                الإعدادات
              </h2>
            </div>

            <div className="space-y-4">
              {/* Sellable */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-6 h-6 text-green-600"
                  />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      نشر الدورة
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      جعل الدورة متاحة للبيع والتسجيل
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("sellable", !formData.sellable)
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    formData.sellable
                      ? "bg-green-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      formData.sellable ? "right-1" : "right-8"
                    }`}
                  />
                </button>
              </div>

              {/* Pinned */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="solar:pin-bold"
                    className="w-6 h-6 text-yellow-600"
                  />
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                      تثبيت الدورة
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      عرض الدورة في أعلى القائمة
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("is_pinned", !formData.is_pinned)
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    formData.is_pinned
                      ? "bg-yellow-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      formData.is_pinned ? "right-1" : "right-8"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                <Icon
                  icon="solar:gallery-add-bold"
                  className="w-8 h-8 text-indigo-500"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                صورة الدورة
              </h2>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="course-image"
                />
                <label htmlFor="course-image" className="cursor-pointer">
                  <div className="inline-flex p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-4">
                    <Icon
                      icon="solar:gallery-add-bold"
                      className="w-12 h-12 text-indigo-500"
                    />
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">
                    {imagePreview ? "تغيير الصورة" : "اختر صورة للدورة"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF حتى 5 ميجابايت
                  </p>
                </label>
              </div>

              {imagePreview && (
                <div className="relative w-full max-w-md mx-auto">
                  <img
                    src={imagePreview}
                    alt="Course preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Icon icon="svg-spinners:ring-resize" className="w-6 h-6" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" className="w-6 h-6" />
                  إنشاء الدورة
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
