import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function Pagination({ currentPage, totalPages, onPageChange, variant = "light" }) {
  if (totalPages <= 1) return null;

  const isDark = variant === "dark";

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = currentPage === i;
      let cls;
      if (isActive) {
        cls = "bg-emerald-500 text-white";
      } else if (isDark) {
        cls = "bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10";
      } else {
        cls = "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200";
      }

      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${cls}`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  const navBtnClass = (disabled) => {
    if (isDark) {
      return `p-2 rounded-md transition-colors border border-white/10 ${
        disabled
          ? "bg-white/5 text-slate-500 cursor-not-allowed"
          : "bg-white/10 text-slate-200 hover:bg-white/20"
      }`;
    }
    return `p-2 rounded-md transition-colors border border-gray-200 ${
      disabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-white text-gray-700 hover:bg-gray-100"
    }`;
  };

  return (
    <div className="flex items-center justify-center mt-6 space-x-2 w-full overflow-x-auto p-2">
      <button
        onClick={handlePrev}
        disabled={prevDisabled}
        className={navBtnClass(prevDisabled)}
        aria-label="Previous Page"
      >
        <MdChevronLeft className="w-5 h-5" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={handleNext}
        disabled={nextDisabled}
        className={navBtnClass(nextDisabled)}
        aria-label="Next Page"
      >
        <MdChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
