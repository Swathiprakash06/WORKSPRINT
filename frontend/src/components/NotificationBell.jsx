import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPut } from '../services/api';

const relativeTime = (value) => {
  const createdAt = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) === 1 ? '' : 's'} ago`;
  return createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const typeClasses = {
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-violet-100 text-violet-800',
};

const NotificationBell = ({ role }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);
  const basePath = role === 'hrAdmin' ? '/api/v1/hr-admin' : '/api/v1/employee';

  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiGet(`${basePath}/notifications`);
      if (response.ok) setNotifications(await response.json());
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [basePath]);

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      loadNotifications();
    }, 0);
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadNotifications]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        const response = await apiPut(`${basePath}/notifications/${notification.id}/read`, {});
        if (response.ok) {
          setNotifications((items) => items.map((item) => (
            item.id === notification.id ? { ...item, isRead: true } : item
          )));
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    setOpen(false);
    if (notification.linkPath) navigate(notification.linkPath);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      const response = await apiPut(`${basePath}/notifications/read-all`, {});
      if (response.ok) {
        setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((visible) => !visible);
          if (!open) loadNotifications();
        }}
        className="relative rounded-lg p-2 text-[#A0AEC0] transition-colors hover:bg-white/10 hover:text-white"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="font-semibold">Notifications</p>
              <p className="text-xs text-gray-500">{unreadCount ? `${unreadCount} unread` : 'All caught up'}</p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || markingAll}
              title="Mark all as read"
              aria-label="Mark all notifications as read"
              className="rounded p-1 text-violet-600 transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet</p>
            ) : notifications.map((notification) => (
              <button
                type="button"
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${notification.isRead ? 'bg-white' : 'bg-violet-50/70'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                  {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />}
                </div>
                <p className="mt-1 text-sm leading-5 text-gray-600">{notification.message}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium capitalize ${typeClasses[notification.type] || typeClasses.info}`}>
                    {notification.category || notification.type || 'General'}
                  </span>
                  <span className="text-gray-400">{relativeTime(notification.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
