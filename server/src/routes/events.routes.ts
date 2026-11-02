import { Router } from "express";
import { ObjectId } from "mongodb";
import { client } from "../config/database.js";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

function eventsCollection() {
  const name = process.env.MONGODB_DB_NAME;
  if (!name) throw new Error("Database configuration is missing.");
  return client.db(name).collection("events");
}

async function currentUser(req: Parameters<typeof router.get>[1] extends never ? never : any) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  return session?.user ?? null;
}

router.get("/", async (req, res) => {
  try {
    const limitValue = Number(req.query.limit);
    const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 50) : 6;
    const filter = req.query.upcoming === "true" ? { eventDate: { $gte: new Date().toISOString() } } : {};
    const events = await eventsCollection().find(filter).sort({ eventDate: 1, createdAt: -1 }).limit(limit).toArray();
    res.status(200).json({ success: true, events });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load events." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid event ID." });
    const event = await eventsCollection().findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });
    res.status(200).json({ success: true, event });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load event." });
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please log in to create an event." });
    const { title, description, imageUrl, location, category, eventDate } = req.body ?? {};
    if (![title, description, location, category, eventDate].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ success: false, message: "Please complete all required fields." });
    }
    const date = new Date(eventDate);
    if (Number.isNaN(date.getTime()) || date <= new Date()) return res.status(400).json({ success: false, message: "Event date must be in the future." });
    const document = {
      title: title.trim().slice(0, 120),
      description: description.trim().slice(0, 5000),
      imageUrl: typeof imageUrl === "string" ? imageUrl.trim().slice(0, 1000) : "",
      location: location.trim().slice(0, 200),
      category: category.trim().slice(0, 60),
      eventDate: date.toISOString(),
      organizerId: user.id,
      organizerName: user.name || "Community Member",
      organizerEmail: user.email,
      joinedBy: [],
      joinedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await eventsCollection().insertOne(document);
    res.status(201).json({ success: true, event: { ...document, _id: result.insertedId } });
  } catch {
    res.status(500).json({ success: false, message: "Unable to create event." });
  }
});

router.post("/:id/join", async (req, res) => {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please log in to join an event." });
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid event ID." });
    const collection = eventsCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id), eventDate: { $gte: new Date().toISOString() }, joinedBy: { $ne: user.id } },
      { $addToSet: { joinedBy: user.id }, $inc: { joinedCount: 1 }, $set: { updatedAt: new Date().toISOString() } }
    );
    if (result.matchedCount === 0) return res.status(409).json({ success: false, message: "Event is unavailable or you already joined." });
    res.status(200).json({ success: true, message: "You joined this event." });
  } catch {
    res.status(500).json({ success: false, message: "Unable to join event." });
  }
});

router.get("/member/joined", async (req, res) => {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please log in." });
    const events = await eventsCollection().find({ joinedBy: user.id }).sort({ eventDate: 1 }).toArray();
    res.status(200).json({ success: true, events });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load joined events." });
  }
});

router.get("/member/managed", async (req, res) => {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please log in." });
    const events = await eventsCollection().find({ organizerId: user.id }).sort({ createdAt: -1 }).toArray();
    res.status(200).json({ success: true, events });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load managed events." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please log in." });
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid event ID." });
    const result = await eventsCollection().deleteOne({ _id: new ObjectId(req.params.id), organizerId: user.id });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Event not found or you do not own it." });
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Unable to delete event." });
  }
});

export default router;
