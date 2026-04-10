import { useNotifications } from "../notifications.jsx";

const variants = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

const NotificationTray = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="pointer-events-none fixed inset-x-4 top-24 z-50 flex max-w-sm flex-col gap-3 sm:left-auto sm:right-6">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg ${variants[notification.type]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <p>{notification.message}</p>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              onClick={() => removeNotification(notification.id)}
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationTray;
