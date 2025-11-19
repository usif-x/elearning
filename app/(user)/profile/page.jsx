"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { getUserQuizAnalytics } from "@/services/QuizAnalytics";
import { getCurrentUserProfile } from "@/services/User";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import NotificationsTab from "./components/NotificationsTab";
import PersonalInfoTab from "./components/PersonalInfoTab";
import ProfileOverviewTab from "./components/ProfileOverviewTab";
import ProfileSidebar from "./components/ProfileSidebar";
import QuizResultsTab from "./components/QuizResultsTab";
import SecurityTab from "./components/SecurityTab";
import WalletTab from "./components/WalletTab";

const UserProfile = () => {
  const { user: authUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [quizResults, setQuizResults] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "quiz-results") {
      loadQuizResults();
    }
  }, [activeTab]);

  const loadUserProfile = async () => {
    setUserLoading(true);
    try {
      const userData = await getCurrentUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Fallback to auth store data if API fails
      setUser(authUser);
    } finally {
      setUserLoading(false);
    }
  };

  const loadQuizResults = async () => {
    setQuizLoading(true);
    try {
      const data = await getUserQuizAnalytics();
      setQuizResults(data.quizzes || []);
    } catch (error) {
      console.error("Error loading quiz results:", error);
    } finally {
      setQuizLoading(false);
    }
  };

  const profileTabs = [
    {
      id: "overview",
      label: "نظرة عامة",
      icon: "solar:user-id-bold",
    },
    {
      id: "personal-info",
      label: "المعلومات الشخصية",
      icon: "solar:card-bold",
    },
    {
      id: "quiz-results",
      label: "نتائج الاختبارات",
      icon: "solar:clipboard-list-bold",
    },
    {
      id: "security",
      label: "الأمان والخصوصية",
      icon: "solar:shield-keyhole-bold",
    },
    {
      id: "notifications",
      label: "الإشعارات",
      icon: "solar:bell-bold",
    },
    {
      id: "wallet",
      label: "المحفظة",
      icon: "solar:wallet-bold",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ProfileOverviewTab user={user} />;

      case "personal-info":
        return <PersonalInfoTab user={user} />;

      case "quiz-results":
        return (
          <QuizResultsTab quizResults={quizResults} quizLoading={quizLoading} />
        );

      case "security":
        return <SecurityTab user={user} />;

      case "notifications":
        return <NotificationsTab />;

      case "wallet":
        return <WalletTab user={user} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {userLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
                <Icon
                  icon="solar:user-id-bold"
                  className="w-8 h-8 text-white animate-pulse"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                جاري تحميل الملف الشخصي...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">يرجى الانتظار</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Navigation Section */}
            <div className="lg:col-span-4 xl:col-span-3">
              <ProfileSidebar
                user={user}
                profileTabs={profileTabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>

            {/* Content Section */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
