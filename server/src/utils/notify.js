import Notification from "../models/Notification.js";

// Creating a notification must never break the action that triggered it,
// so failures are logged and swallowed rather than thrown.
const notify = async ({ user, type, title, body, link }) => {
  try {
    await Notification.create({
      user,
      type,
      title,
      body: body || "",
      link: link || "/",
    });
  } catch (error) {
    console.log("Notify error:", error.message);
  }
};

export default notify;
