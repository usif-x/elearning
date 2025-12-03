"use client";

import { getUserDetails } from "@/services/admin/User";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminUserDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserDetails(id);
        setUser(data);
      } catch (err) {
        console.error("Failed to load user details:", err);
        setError(
          err?.response?.data?.detail ||
            err.message ||
            "فشل في جلب بيانات المستخدم"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="w-12 h-12 text-sky-500 mx-auto mb-4 animate-spin"
          />
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل بيانات المستخدم...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600">
          <p className="mb-4">خطأ: {error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("ar-EG");
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              بيانات المستخدم
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              عرض تفاصيل حساب وإحصاءات المستخدم
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              العودة
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const data = await getUserDetails(id);
                  setUser(data);
                } catch (e) {
                  setError(e?.message || "خطأ");
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              تحديث
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 col-span-1">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {user.profile_picture ? (
                // using Image for optimization if external URL allowed
                <Image
                  src={user.profile_picture}
                  alt={user.full_name || "avatar"}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Icon
                    icon="material-symbols:person"
                    className="w-8 h-8 text-gray-500"
                  />
                </div>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {user.full_name}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">
                {user.phone_number || "-"}
              </p>
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">الحالة</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {user.status || "-"} {user.is_verified ? " (موثق)" : ""}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">محفظة المستخدم</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {user.wallet_balance || "0"} جنيه
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">تاريخ الإنشاء</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {formatDate(user.created_at)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">آخر تسجيل دخول</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {formatDate(user.last_login)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">إحصاءات الاختبارات</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                small
                title="إجمالي المحاولات"
                value={user.quiz_stats?.total_attempts}
              />
              <Stat
                small
                title="المكتملة"
                value={user.quiz_stats?.completed_attempts}
              />
              <Stat
                small
                title="متوسط الدرجة"
                value={user.quiz_stats?.avg_score}
              />
              <Stat
                small
                title="دقة الإجابة (%)"
                value={user.quiz_stats?.accuracy_rate}
              />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">سجل الاستخدام</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                small
                title="أيام نشطة"
                value={user.usage_stats?.total_days_active}
              />
              <Stat
                small
                title="إجمالي الدقائق"
                value={user.usage_stats?.total_minutes}
              />
              <Stat
                small
                title="متوسط دقيقة/يوم"
                value={user.usage_stats?.avg_minutes_per_day}
              />
              <Stat
                small
                title="إجمالي الساعات"
                value={user.usage_stats?.total_hours}
              />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">أسئلة منشأه</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                small
                title="مجموع المجموعات"
                value={user.generated_questions_stats?.total_sets_generated}
              />
              <Stat
                small
                title="إجمالي الأسئلة"
                value={
                  user.generated_questions_stats?.total_questions_generated
                }
              />
              <Stat
                small
                title="عام"
                value={user.generated_questions_stats?.public_count}
              />
              <Stat
                small
                title="خاص"
                value={user.generated_questions_stats?.private_count}
              />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">اختبارات الممارسة</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                small
                title="الإجمالي"
                value={user.practice_quiz_stats?.total_practice_quizzes}
              />
              <Stat
                small
                title="مكتملة"
                value={user.practice_quiz_stats?.completed_count}
              />
              <Stat
                small
                title="نصفية"
                value={user.practice_quiz_stats?.incomplete_count}
              />
              <Stat
                small
                title="متوسط الدرجة"
                value={user.practice_quiz_stats?.avg_score}
              />
            </div>
          </section>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">إحصاءات التسجيل</h3>
          <div className="grid grid-cols-4 gap-3">
            <Stat
              title="مقيد بالكورسات"
              value={user.enrollment_stats?.total_enrolled_courses}
            />
            <Stat
              title="مكتمل"
              value={user.enrollment_stats?.completed_courses}
            />
            <Stat
              title="قيد التنفيذ"
              value={user.enrollment_stats?.in_progress_courses}
            />
            <Stat
              title="متوسط التقدم (%)"
              value={user.enrollment_stats?.avg_progress}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value, small }) {
  return (
    <div
      className={`bg-gray-50 dark:bg-gray-700 p-3 rounded-lg ${
        small ? "text-sm" : "text-base"
      }`}
    >
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="font-bold text-gray-900 dark:text-white">{value ?? "-"}</p>
    </div>
  );
}
