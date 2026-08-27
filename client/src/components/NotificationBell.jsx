import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios.js";

const timeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const res = await api.get("/notifications");

      setItems(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch {
      // a failed poll should never break the navbar
    }
  };

  useEffect(() => {
    load();

    // simple polling, good enough without websockets
    const timer = setInterval(load, 20000);

    return () => clearInterval(timer);
  }, []);

  // close when clicking outside the dropdown
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);

    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openItem = async (item) => {
    setOpen(false);

    if (!item.read) {
      try {
        await api.patch(`/notifications/${item._id}/read`);
      } catch {
        // still navigate even if marking read fails
      }
    }

    await load();

    navigate(item.link || "/");
  };

  const markAll = async () => {
    try {
      await api.patch("/notifications/read-all");

      await load();
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 text-slate-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-red-500 rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>

            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-500 text-center">
                Nothing yet.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => openItem(item)}
                  className={
                    item.read
                      ? "w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100"
                      : "w-full text-left px-4 py-3 bg-indigo-50/60 hover:bg-indigo-50 border-b border-slate-100"
                  }
                >
                  <div className="flex items-start gap-2">
                    {!item.read && (
                      <span className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-indigo-500" />
                    )}

                    <div className={item.read ? "pl-4" : ""}>
                      <p className="text-sm font-medium text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.body}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
