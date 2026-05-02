const express = require("express");
const { getMyNotifications, markAsRead, markAllRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/my", getMyNotifications);
router.put("/markAllRead", markAllRead);
router.put("/:id/read", markAsRead);

module.exports = router;
