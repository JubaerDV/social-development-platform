export const EVENT_TYPES = [
  "Cleanup", "Plantation", "Donation", "Community Service", "Environment",
  "Education", "Health", "Fundraising", "Other",
] as const;

type EventInput = {
  title: string; description: string; imageUrl: string;
  location: string; category: string; eventDate: string;
};
type ValidationResult =
  | { success: true; data: EventInput }
  | { success: false; message: string };

export function validateEventInput(value: unknown, now = Date.now()): ValidationResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { success: false, message: "Please complete the event form." };
  }
  const body = value as Record<string, unknown>;
  function text(key: string, max: number): string | null {
    const item = body[key];
    if (typeof item !== "string") return null;
    const clean = item.trim();
    return clean.length > 0 && clean.length <= max ? clean : null;
  }
  const title = text("title", 120);
  const description = text("description", 5000);
  const location = text("location", 200);
  if (!title || !description || !location) {
    return { success: false, message: "Title, description and location are required and must stay within their character limits." };
  }
  const category = text("category", 60);
  if (!category || !(EVENT_TYPES as readonly string[]).includes(category)) {
    return { success: false, message: "Please select a valid event type from the list." };
  }
  const imageUrl = text("imageUrl", 1000);
  if (!imageUrl) return { success: false, message: "An event image URL is required (maximum 1000 characters)." };
  try {
    const image = new URL(imageUrl);
    if (!["http:", "https:"].includes(image.protocol) || !image.hostname) throw new Error();
  } catch {
    return { success: false, message: "Please enter a valid HTTP or HTTPS image URL." };
  }
  const eventDate = body.eventDate;
  if (typeof eventDate !== "string") return { success: false, message: "Please choose a valid future event date and time." };
  const date = new Date(eventDate);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= now || date.toISOString() !== eventDate) {
    return { success: false, message: "Please choose a valid future event date and time." };
  }
  return { success: true, data: { title, description, location, category, imageUrl, eventDate } };
}
