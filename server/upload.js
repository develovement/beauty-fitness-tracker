const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router(); // 🔥 INI WAJIB
const upload = multer();

// POST /api/upload-video
router.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    const form = new FormData();

    form.append("chat_id", process.env.TELEGRAM_CHAT_ID);
    form.append("video", req.file.buffer, {
      filename: `latihan-${Date.now()}.webm`,
      contentType: "video/webm",
    });

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendVideo`,
      form,
      { headers: form.getHeaders() }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal kirim ke Telegram" });
  }
});

// 🔥 INI PALING PENTING
module.exports = router;
