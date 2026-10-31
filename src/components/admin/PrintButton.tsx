"use client";

// Opens the browser's print dialog, where "Save as PDF" makes the PDF.
export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm hover:border-c1 print:hidden"
    >
      {label}
    </button>
  );
}
