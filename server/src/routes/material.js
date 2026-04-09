import express from "express";
import multer from "multer";
import path from "path";
import Material from "../models/Material.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF and document files are allowed"));
  },
});

router.get("/:courseId", protect, async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.courseId }).populate("instructor", "name email");
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:courseId", protect, upload.single("file"), async (req, res) => {
  try {
    if (req.user.role !== "instructor") return res.status(403).json({ message: "Forbidden" });

    let url = req.body.url;
    let fileKey = "";

    if (req.file) {
      fileKey = req.file.filename;
      url = `/uploads/${req.file.filename}`;
    }

    if (!url) return res.status(400).json({ message: "URL or file is required" });

    const material = await Material.create({
      title: req.body.title,
      description: req.body.description || "",
      type: req.body.type || "document",
      url,
      fileKey,
      course: req.params.courseId,
      instructor: req.user._id,
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "instructor") return res.status(403).json({ message: "Forbidden" });
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
