"use server";

import { getDb } from "@/lib/db";
import { notify } from "@/lib/notify";
import { requestIpHash, takeRateLimit } from "@/lib/rate-limit";
import { testimonialSchema } from "@/lib/validation/business";

export type TestimonialState = { status: "idle" | "sent" | "error"; message?: string };

// A client's testimonial from the public form. It waits as "pending" until approved in the admin.
export async function submitTestimonial(
  _previous: TestimonialState,
  form: FormData,
): Promise<TestimonialState> {
  // A hidden field people never see; bots that fill every input get a quiet "sent".
  if (String(form.get("website") ?? "") !== "") return { status: "sent" };

  const field = (name: string) => String(form.get(name) ?? "").trim();
  const rating = Number(field("rating"));
  const parsed = testimonialSchema.safeParse({
    name: field("name"),
    role: field("role") || null,
    company: field("company") || null,
    quote: field("quote").replace(/\r\n/g, "\n"),
    rating: rating >= 1 && rating <= 5 ? rating : null,
    status: "PENDING",
    order: 0,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const db = getDb();
  if (!db)
    return { status: "error", message: "The form is not open yet. Please email me instead." };
  if (!(await takeRateLimit(`testimonial:${await requestIpHash()}`, 3, 86_400_000))) {
    return { status: "error", message: "Thanks! You've already sent a few today." };
  }
  try {
    const row = await db.testimonial.create({ data: parsed.data });
    await notify(
      "testimonial",
      `New testimonial from ${row.name}`,
      row.quote.slice(0, 140),
      `/admin/testimonials/${row.id}`,
    );
  } catch {
    return { status: "error", message: "Sending failed. Please try again." };
  }
  return { status: "sent" };
}
