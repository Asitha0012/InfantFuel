import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from "../redux/api/notifications";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const NotificationBell = ({ iconSize = 20, open, setOpen }) => {
  const [showAll, setShowAll] = useState(false);
  const { data: notifications = [], refetch } = useGetNotificationsQuery(10);
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const navigate = useNavigate();
  const bellRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAll = async () => {
    await markAllAsRead();
    refetch();
  };

  return (
    <div className="relative" ref={bellRef}>
      <button onClick={() => setOpen((v) => !v)} className="relative">
        <Bell className="text-gray-700" width={iconSize} height={iconSize} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg z-50 border">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold text-gray-800">Notifications</span>
            <button
              className="text-xs text-indigo-600 hover:underline"
              onClick={handleMarkAll}
            >
              Mark all as read
            </button>
          </div>
          <ul>
            {notifications.length === 0 && (
              <li className="px-4 py-4 text-gray-500 text-center">No notifications</li>
            )}
            {(showAll ? notifications.slice(0, 10) : notifications.slice(0, 5)).map((n) => (
              <li
                key={n._id}
                className={
                  (n.isRead ? "bg-gray-100 opacity-70" : "bg-white") +
                  " px-4 py-3 border-b last:border-b-0 cursor-pointer transition hover:bg-indigo-50"
                }
                onClick={() => {
                  setOpen(false);
                  if (n.link) navigate(n.link);
                }}
              >
                <span className="font-medium">{n.message}</span>
                <span className="block text-xs text-gray-400 mt-1">
                  {n.createdAt && new Date(n.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          {notifications.length > 5 && !showAll && (
            <button
              className="w-full py-2 text-indigo-600 hover:bg-indigo-50 border-t text-sm"
              onClick={() => setShowAll(true)}
            >
              Show more
            </button>
          )}
          {showAll && notifications.length > 5 && (
            <button
              className="w-full py-2 text-indigo-600 hover:bg-indigo-50 border-t text-sm"
              onClick={() => setShowAll(false)}
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

NotificationBell.propTypes = {
  iconSize: PropTypes.number,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default NotificationBell;