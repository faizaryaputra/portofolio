import fs from "fs";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";

// Baca serviceAccountKey.json
const serviceAccount = JSON.parse(
  fs.readFileSync("./backend/serviceAccountKey.json", "utf8")
);

// Inisialisasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Referensi ke Firestore
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint untuk create comment
app.post("/comments", async (req, res) => {
  try {
    const { name, message, photo, email } = req.body;
    const commentData = {
      name,
      message,
      photo: photo || null,
      email: email || null,
      likes: 0,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "unread"
    };
    const docRef = await db.collection("comments").add(commentData);
    res.status(201).json({ success: true, id: docRef.id, message: "Comment created successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk ambil semua comment
app.get("/comments", async (req, res) => {
  try {
    const snapshot = await db.collection("comments").orderBy("timestamp", "desc").get();
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
