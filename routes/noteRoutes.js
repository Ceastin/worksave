const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Note = require("../models/Note");

// Multer storage -> public/uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, "../public/uploads");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ----------------- ROUTES -----------------

// Landing page - render an input to ask for pageId
router.get("/", (req, res) => {
    res.render("index"); // views/index.ejs
});

// GET Notepad Page
router.get("/:pageId", async (req, res) => {
    try {
        const { pageId } = req.params;
        let note = await Note.findOne({ pageId }).select("-passcode");
        if (!note) {
            note = new Note({ pageId });
            await note.save();
        }
        res.render("notepad", { note });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// POST Update Content (autosave)
router.post("/:pageId", async (req, res) => {
    try {
        const { pageId } = req.params;
        const { content } = req.body;
        await Note.findOneAndUpdate({ pageId }, { content }, { upsert: true });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// POST Upload Image
router.post("/:pageId/upload", upload.single("image"), async (req, res) => {
    try {
        const { pageId } = req.params;
        if (!req.file) return res.status(400).send("No image uploaded");

        const imagePath = "/uploads/" + req.file.filename; // relative to /public
        const note = await Note.findOneAndUpdate(
            { pageId },
            { $push: { images: imagePath } },
            { new: true, upsert: true }
        );
        res.redirect("/" + pageId);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// POST Set or Verify Passcode
router.post("/:pageId/passcode", async (req, res) => {
  const { pageId } = req.params;
  const { passcode } = req.body;

  let note = await Note.findOne({ pageId });
  if (!note) return res.json({ status: "not_found" });

  // If no passcode set — create new (hashed automatically)
  if (note.passcode === "") {
    if (passcode.length === 6 && /^\d+$/.test(passcode)) {
      note.passcode = passcode;
      await note.save();
      return res.json({ status: "set" });
    } else {
      return res.json({ status: "invalid" });
    }
  } else {
    // Verify hashed passcode
    const isMatch = await note.comparePasscode(passcode);
    if (isMatch) return res.json({ status: "success" });
    else return res.json({ status: "fail" });
  }
});

module.exports = router;
