import type { Notification, NotificationType } from "@prisma/client";

export type INotification = Notification;
export type { NotificationType };

export interface IPaginatedNotifications {
  items: INotification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
