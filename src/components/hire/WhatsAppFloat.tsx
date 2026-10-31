import { Icon } from "@/components/ui/Icon";
import { whatsappUrl } from "@/lib/hire";

// A WhatsApp shortcut on every page, stacked above the back-to-top button so neither covers the
// other, and lifted clear of mobile browser bars. Hidden until a number is configured.
export function WhatsAppFloat() {
  const href = whatsappUrl();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className="whatsapp-float grid size-14 place-items-center rounded-full bg-c1 text-c1-ink shadow-(--shadow-lift) transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-(--fill-2)"
    >
      <Icon name="whatsapp" size={26} />
    </a>
  );
}
