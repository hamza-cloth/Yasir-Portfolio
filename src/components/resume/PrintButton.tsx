"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

// The browser's print dialog doubles as "Save as PDF"; the print rules in pages.css hide the site chrome.
export function PrintButton() {
  return (
    <Button variant="primary" size="lg" onClick={() => window.print()}>
      <Icon name="printer" size={17} />
      Print or save as PDF
    </Button>
  );
}
