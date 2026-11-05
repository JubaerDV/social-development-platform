import assert from "node:assert/strict";
import { test } from "node:test";
import { validateEventInput, EVENT_TYPES } from "../dist/lib/event-validation.js";

const now = Date.parse("2026-11-05T00:00:00.000Z");
const valid = {
  title: "  Community cleanup  ", description: "Help clean the neighbourhood.",
  location: "Mirpur 10, Dhaka", category: "Cleanup",
  imageUrl: "https://images.example.org/community.jpg",
  eventDate: "2026-11-06T00:00:00.000Z",
};
const check = changes => validateEventInput({ ...valid, ...changes }, now);

test("accepts valid future events and trims text", () => {
  const result = check({});
  assert.equal(result.success, true);
  assert.equal(result.data.title, "Community cleanup");
});
test("rejects missing, whitespace-only and oversized required text", () => {
  for (const changes of [{ title: " " }, { location: "" }, { description: null }, { title: "a".repeat(121) }, { description: "a".repeat(5001) }, { location: "a".repeat(201) }]) {
    assert.equal(check(changes).success, false);
  }
});
test("requires an absolute HTTP or HTTPS image URL", () => {
  for (const imageUrl of [undefined, "", " ", "/image.jpg", "not-a-url", "javascript:alert(1)", "data:image/png;base64,xxx", "https://"])
    assert.equal(check({ imageUrl }).success, false);
  assert.equal(check({ imageUrl: "http://images.example.org/photo.jpg" }).success, true);
});
test("accepts listed types and rejects arbitrary event types", () => {
  for (const category of EVENT_TYPES) assert.equal(check({ category }).success, true);
  assert.equal(check({ category: "not-listed" }).success, false);
});
test("rejects past, current, invalid and ambiguous dates", () => {
  for (const eventDate of ["2026-11-04T00:00:00.000Z", "2026-11-05T00:00:00.000Z", "invalid", "2027-02-30T00:00:00.000Z", "2026-11-06T12:00", null])
    assert.equal(check({ eventDate }).success, false);
});
test("ignores supplied ownership and participant fields", () => {
  const result = check({ organizerId: "another-user", joinedBy: ["fake-member"] });
  assert.equal(result.success, true);
  assert.equal("organizerId" in result.data, false);
  assert.equal("joinedBy" in result.data, false);
});
test("rejects malformed request bodies", () => {
  for (const body of [null, [], "text", 42]) assert.equal(validateEventInput(body, now).success, false);
});
