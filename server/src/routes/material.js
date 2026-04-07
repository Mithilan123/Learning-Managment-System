import express from "express";
import Material from "../models/Material.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/:courseId", protect, async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.courseId }).populate("instructor", "name email");
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:courseId", protect, async (req, res) => {
  try {
    if (req.user.role !== "instructor") return res.status(403).json({ message: "Forbidden" });
    const material = await Material.create({ ...req.body, course: req.params.courseId, instructor: req.user._id });
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
