"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { getUserQuizAnalytics } from "@/services/QuizAnalytics";
import { useEffect, useState } from "react";
import NotificationsTab from "./components/NotificationsTab";
import PersonalInfoTab from "./components/PersonalInfoTab";
import ProfileOverviewTab from "./components/ProfileOverviewTab";
import ProfileSidebar from "./components/ProfileSidebar";
import QuizResultsTab from "./components/QuizResultsTab";
import SecurityTab from "./components/SecurityTab";
import WalletTab from "./components/WalletTab";

const UserProfile = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [quizResults, setQuizResults] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "quiz-results") {
      loadQuizResults();
    }
  }, [activeTab]);

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
      </div>
    </div>
  );
};

export default UserProfile;
