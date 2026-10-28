import type { ComponentProps } from "react";

// Wide tables scroll inside their own box instead of widening the page.
export function TableScroll(props: ComponentProps<"table">) {
  return (
    <div className="table-scroll" role="region" aria-label="Table" tabIndex={0}>
      <table {...props} />
    </div>
  );
}
