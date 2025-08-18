// components/ui/LoadingSpinner.jsx
import { Icon } from "@iconify/react";

const LoadingSpinner = ({
  size = "medium",
  text = "جاري التحميل...",
  showText = true,
  color = "blue",
}) => {
  // Size configurations
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xl: "text-xl",
  };

  const containerSizes = {
    small: "gap-2",
    medium: "gap-3",
    large: "gap-4",
    xl: "gap-5",
  };

  // Color configurations
  const colorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500",
    gray: "text-gray-500",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerSizes[size]}`}
    >
      {/* Spinner Icon */}
      <div className="relative">
        <Icon
          icon="solar:loading-bold"
          className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        />
      </div>

      {/* Loading Text */}
      {showText && text && (
        <p
          className={`${textSizes[size]} font-medium text-gray-600 dark:text-gray-400 text-center`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

// Alternative spinner with dots animation
const LoadingDots = ({ text = "جاري التحميل", color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    gray: "bg-gray-500",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex gap-1">
        <div
          className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      {text && (
        <p className="text-base font-medium text-gray-600 dark:text-gray-400 text-center">
          {text}
        </p>
      )}
    </div>
  );
};

// Page-level loading overlay
const LoadingOverlay = ({ text = "جاري التحميل...", transparent = false }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        transparent ? "bg-black/20" : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="text-center">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
};

// Button loading state
const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`relative ${className} ${
        loading || disabled ? "opacity-75 cursor-not-allowed" : ""
      }`}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="small" showText={false} color="white" />
        </div>
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
    </button>
  );
};

// Skeleton loader for content
const SkeletonLoader = ({ lines = 3, className = "" }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
            index === lines - 1 ? "w-3/4" : "w-full"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
export { LoadingButton, LoadingDots, LoadingOverlay, SkeletonLoader };
