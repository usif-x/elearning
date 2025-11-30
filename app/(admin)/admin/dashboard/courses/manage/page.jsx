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
    <div className="p-6 min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              إنشاء دورة جديدة
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              أضف محتوى تعليمي جديد ومميز إلى المنصة
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
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
                  {/* Course Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      اسم الدورة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                      placeholder="مثال: مقدمة في البرمجة بلغة بايثون"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      وصف الدورة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 resize-none"
                      placeholder="اكتب وصفاً شاملاً لمحتوى الدورة وما سيتعلمه الطلاب..."
                      required
                    />
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
                  {/* Free Course Toggle */}
                  <div className="flex items-center justify-between p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Icon
                          icon="solar:gift-bold"
                          className="w-6 h-6 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          دورة مجانية
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          إتاحة المحتوى للجميع مجاناً
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange("is_free", !formData.is_free)
                      }
                      className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                        formData.is_free
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                          formData.is_free ? "right-1" : "right-8"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Price Fields */}
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${
                      formData.is_free
                        ? "opacity-50 pointer-events-none grayscale"
                        : "opacity-100"
                    }`}
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        السعر الحالي ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
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
                          disabled={formData.is_free}
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white transition-all text-left dir-ltr"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        السعر قبل الخصم ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
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
                          disabled={formData.is_free}
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white transition-all text-left dir-ltr"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
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
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 ${
                      imagePreview
                        ? "border-green-500/50 bg-green-50/10"
                        : "border-gray-300 dark:border-gray-600 hover:border-red-500/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="course-image"
                    />
                    
                    {imagePreview ? (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Course preview"
                          className="w-full h-48 object-cover rounded-xl shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                          <label
                            htmlFor="course-image"
                            className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-lg cursor-pointer transition-colors"
                          >
                            <Icon icon="solar:pen-bold" className="w-5 h-5" />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedImageFile(null);
                            }}
                            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="course-image"
                        className="block cursor-pointer py-8"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                          <Icon
                            icon="solar:gallery-add-bold"
                            className="w-8 h-8"
                          />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          اضغط لرفع صورة
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG حتى 5MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  إعدادات النشر
                </h3>
                <div className="space-y-4">
                  {/* Sellable */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Icon
                          icon="solar:check-circle-bold"
                          className="w-4 h-4 text-green-600 dark:text-green-400"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          نشر الدورة
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          إتاحة للبيع
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange("sellable", !formData.sellable)
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                        formData.sellable
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                          formData.sellable ? "right-1" : "right-6"
                        }`}
                      />
                    </button>
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
                          تثبيت الدورة
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          في الأعلى
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange("is_pinned", !formData.is_pinned)
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                        formData.is_pinned
                          ? "bg-purple-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                          formData.is_pinned ? "right-1" : "right-6"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold shadow-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                      <span>جاري...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                      <span>إنشاء</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
