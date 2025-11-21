"use client";

import CourseCard from "@/components/ui/CourseCard";
import { getSearchAutocomplete, searchCourses } from "@/services/Courses";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const metadata = {
  title: "البحث في الكورسات",
};

export default function CourseSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // State management
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize] = useState(12);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sellableOnly, setSellableOnly] = useState(true);

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Perform search
  const performSearch = useCallback(
    async (query, page = 1, categoryId = null, sellable = true) => {
      if (!query.trim()) {
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(1);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await searchCourses(
          query,
          page,
          pageSize,
          categoryId,
          sellable
        );

        setSearchResults(response.courses || []);
        setTotalResults(response.total || 0);
        setTotalPages(response.total_pages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error("Search error:", err);
        setError("حدث خطأ في البحث. يرجى المحاولة مرة أخرى.");
        setSearchResults([]);
        setTotalResults(0);
        setTotalPages(1);
      } finally {
        setIsSearching(false);
      }
    },
    [pageSize]
  );

  // Get autocomplete suggestions
  const getAutocompleteSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }

    try {
      const suggestions = await getSearchAutocomplete(query, 8);
      setAutocompleteSuggestions(suggestions);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setAutocompleteSuggestions([]);
    }
  }, []);

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for autocomplete
    const newTimeout = setTimeout(() => {
      getAutocompleteSuggestions(value);
    }, 300);

    setSearchTimeout(newTimeout);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);

    if (searchQuery.trim()) {
      performSearch(searchQuery, 1, selectedCategory, sellableOnly);
      // Update URL
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      router.push(`/courses/search?${params.toString()}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion, 1, selectedCategory, sellableOnly);

    // Update URL
    const params = new URLSearchParams();
    params.set("q", suggestion);
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/courses/search?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page) => {
    performSearch(searchQuery, page, selectedCategory, sellableOnly);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle filter changes
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1, categoryId, sellableOnly);
    }
  };

  const handleSellableChange = (sellable) => {
    setSellableOnly(sellable);
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1, selectedCategory, sellable);
    }
  };

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get("q");
    const category = searchParams.get("category");

    if (query) {
      setSearchQuery(query);
      if (category) {
        setSelectedCategory(category);
      }
      performSearch(query, 1, category, sellableOnly);
    }
  }, [searchParams, performSearch, sellableOnly]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            البحث في الكورسات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            ابحث عن الكورسات التي تهمك من بين آلاف الكورسات المتاحة
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="ابحث عن كورسات الطب، البرمجة، إلخ..."
                className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                dir="rtl"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={isSearching}
              >
                <Icon icon="material-symbols:search" className="w-6 h-6" />
              </button>
            </div>

            {/* Autocomplete Suggestions */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        icon="material-symbols:search"
                        className="w-5 h-5 text-gray-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {suggestion}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              الكورسات المتاحة للشراء فقط:
            </label>
            <button
              onClick={() => handleSellableChange(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sellableOnly
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              نعم
            </button>
            <button
              onClick={() => handleSellableChange(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !sellableOnly
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              الكل
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="mb-8">
          {isSearching ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري البحث...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Icon
                icon="material-symbols:error"
                className="w-16 h-16 text-red-500 mx-auto mb-4"
              />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() =>
                  performSearch(
                    searchQuery,
                    currentPage,
                    selectedCategory,
                    sellableOnly
                  )
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-gray-600 dark:text-gray-400">
                  تم العثور على{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalResults}
                  </span>{" "}
                  كورس
                  {totalResults > 1 ? "" : ""}
                </div>
                {totalPages > 1 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    الصفحة {currentPage} من {totalPages}
                  </div>
                )}
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {searchResults.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon
                      icon="material-symbols:chevron-right"
                      className="w-5 h-5"
                    />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          pageNum === currentPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon
                      icon="material-symbols:chevron-left"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              )}
            </>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-12">
              <Icon
                icon="material-symbols:search-off"
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                لم يتم العثور على نتائج
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                جرب كلمات بحث مختلفة أو تحقق من الإملاء
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  اقتراحات:
                </span>
                {["طب", "برمجة", "رياضيات", "علوم"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon
                icon="material-symbols:search"
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ابدأ البحث عن الكورسات
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                اكتب اسم الكورس أو الموضوع الذي تبحث عنه في مربع البحث أعلاه
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
