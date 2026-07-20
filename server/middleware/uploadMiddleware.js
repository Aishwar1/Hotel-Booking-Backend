import multer from "multer";

// ── Allowed file types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_FILE_SIZE_MB   = 5;

// ── File filter ───────────────────────────────────────────────────────────────
// Multer calls this for every file before storing it.
// We reject anything that isn't a JPEG, PNG, or WebP, checking both the
// reported MIME type and the file extension to prevent extension-spoofing.
const fileFilter = (_req, file, cb) => {
    const ext = file.originalname
        .slice(file.originalname.lastIndexOf("."))
        .toLowerCase();

    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
};

// ── Multer instance ───────────────────────────────────────────────────────────
// diskStorage({}) writes to the OS temp directory; the room controller
// uploads from there to Cloudinary and then deletes the temp file.
const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

export default upload;
