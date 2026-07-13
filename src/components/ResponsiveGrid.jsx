import React from "react";

export default function ResponsiveGrid({ children }) {
  // Default grid: mobile 2 cols, tablet 3 cols, desktop 4 cols
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {children}
    </div>
  );
}
