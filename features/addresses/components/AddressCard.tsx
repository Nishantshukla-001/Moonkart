"use client";

import { Briefcase, Home, MapPin, Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IAddress } from "@/types/address";

const typeIcons = { HOME: Home, WORK: Briefcase, OTHER: MapPin } as const;

interface AddressCardProps {
  address: IAddress;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

export function AddressCard({
  address,
  selectable,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const TypeIcon = typeIcons[address.addressType];

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <TypeIcon className="size-4 shrink-0 text-blush-hover" aria-hidden="true" />
          <span className="font-heading text-sm font-semibold text-text-primary capitalize">
            {address.addressType.toLowerCase()}
          </span>
          {address.isDefault && (
            <Badge variant="outline" className="border-transparent bg-blush-light text-blush-hover">
              Default
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-0.5 text-sm text-text-secondary">
        <p className="font-medium text-text-primary">{address.fullName}</p>
        <p>
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
        </p>
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
        <p className="mt-1 text-text-muted">{address.phone}</p>
      </div>
    </>
  );

  return (
    <Card
      className={cn(
        "gap-0 p-4 transition-colors duration-[200ms]",
        selectable && "cursor-pointer",
        selected ? "border-blush-hover ring-1 ring-blush-hover" : "border-border-light"
      )}
    >
      {selectable ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="flex flex-col gap-0 text-left outline-none"
        >
          {content}
        </button>
      ) : (
        content
      )}

      {(onEdit || onDelete || onSetDefault) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-divider pt-3">
          {onEdit && (
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <Pencil /> Edit
            </Button>
          )}
          {!address.isDefault && onSetDefault && (
            <Button type="button" variant="outline" size="sm" onClick={onSetDefault}>
              <Star /> Set as Default
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="outline" size="sm" className="text-danger hover:text-danger" onClick={onDelete}>
              <Trash2 /> Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
