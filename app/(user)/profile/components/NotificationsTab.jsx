import { Icon } from "@iconify/react";

const NotificationsTab = () => {
  const handleStartBot = () => {
    // Open Telegram with the bot and /start command
    window.open("https://t.me/DahhehetMedicalBot?start=start", "_blank");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        إعدادات الإشعارات
      </h2>

      <div className="space-y-6">
        {/* Notification Method Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Icon
                  icon="bxl:telegram"
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                الإشعارات عبر تيليجرام
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                جميع الإشعارات يتم إرسالها إلى حسابك في تيليجرام عبر البوت الخاص
                بالمنصة. هذا يضمن وصول الإشعارات إليك فوراً ويوفر تجربة موثوقة.
              </p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:info-circle-bold"
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      تأكد من السماح للبوت بإرسال الرسائل
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      لتلقي الإشعارات، تأكد من أن البوت يمكنه إرسال الرسائل
                      إليك. إذا لم تتلقى إشعارات، جرب بدء محادثة مع البوت مرة
                      أخرى.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartBot}
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                <Icon icon="bxl:telegram" className="w-5 h-5" />
                بدء المحادثة مع البوت
                <Icon
                  icon="solar:arrow-right-bold"
                  className="w-4 h-4 rotate-180"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bot Status */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  البوت متصل ويعمل
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  جميع الإشعارات يتم إرسالها عبر @DahhehetMedicalBot
                </p>
              </div>
            </div>
            <button
              onClick={handleStartBot}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              فتح البوت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
