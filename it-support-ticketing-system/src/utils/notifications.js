export function getNotifications() {
  const saved = localStorage.getItem("allstars_notifications");
  return saved ? JSON.parse(saved) : [];
}

export function saveNotifications(notifications) {
  localStorage.setItem("allstars_notifications", JSON.stringify(notifications));
}

export function addNotification(notification) {
  const notifications = getNotifications();

  const newNotification = {
    id: Date.now(),
    isRead: false,
    createdAt: new Date().toLocaleString(),
    ...notification,
  };

  notifications.unshift(newNotification);
  saveNotifications(notifications);
}