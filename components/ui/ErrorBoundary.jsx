"use client";

import { Icon } from "@iconify/react";
import React from "react";

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              if (this.props.onRetry) {
                this.props.onRetry();
              }
            }}
          />
        )
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const ErrorFallback = ({ error, errorInfo, onRetry }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <Icon
            icon="solar:danger-circle-bold"
            className="w-10 h-10 text-red-500"
          />
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          عذراً، حدث خطأ!
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو تحديث الصفحة.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Icon icon="solar:refresh-bold" className="w-5 h-5" />
            المحاولة مرة أخرى
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon icon="solar:restart-bold" className="w-5 h-5" />
            تحديث الصفحة
          </button>
        </div>

        {/* Error Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
        >
          {showDetails ? "إخفاء التفاصيل" : "عرض تفاصيل الخطأ"}
        </button>

        {/* Error Details */}
        {showDetails && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-left">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              {error && (
                <div>
                  <strong>Error:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-words">
                    {error.toString()}
                  </pre>
                </div>
              )}
              {errorInfo && errorInfo.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple error component for API errors
const ApiError = ({
  message = "حدث خطأ في الاتصال",
  onRetry,
  showRetry = true,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <Icon
        icon="solar:wifi-router-minimalistic-bold"
        className="w-16 h-16 text-gray-400 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        خطأ في الاتصال
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Icon icon="solar:refresh-bold" className="w-4 h-4" />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
};

// Network error component
const NetworkError = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon
        icon="solar:cloud-cross-bold"
        className="w-16 h-16 text-red-400 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        مشكلة في الاتصال
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        تأكد من اتصالك بالإنترنت وحاول مرة أخرى
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Icon icon="solar:refresh-bold" className="w-4 h-4" />
        إعادة المحاولة
      </button>
    </div>
  );
};

// Not found error component
const NotFound = ({
  title = "الصفحة غير موجودة",
  message = "الصفحة التي تبحث عنها غير متوفرة",
  onGoHome,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon
        icon="solar:file-remove-bold"
        className="w-16 h-16 text-gray-400 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <button
        onClick={onGoHome || (() => (window.location.href = "/"))}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Icon icon="solar:home-bold" className="w-4 h-4" />
        العودة للرئيسية
      </button>
    </div>
  );
};

// Main ErrorBoundary wrapper component
const ErrorBoundary = ({ children, fallback, onRetry }) => {
  return (
    <ErrorBoundaryClass fallback={fallback} onRetry={onRetry}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;
export { ApiError, ErrorFallback, NetworkError, NotFound };
