import type { Address, Order, OrderItem } from "@prisma/client";

export type IOrder = Order;
export type IOrderItem = OrderItem;

export interface IOrderWithItems extends IOrder {
  items: IOrderItem[];
  address: Address | null;
}

export interface IPaginatedOrders {
  items: IOrderWithItems[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
