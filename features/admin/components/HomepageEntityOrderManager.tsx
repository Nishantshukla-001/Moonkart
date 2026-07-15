"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiResponse } from "@/features/admin/services/adminApi";

export interface OrderableItem {
  id: string;
  displayOrder: number;
  isVisible: boolean;
  name: string;
  image?: string | null;
}

interface AvailableOption {
  id: string;
  name: string;
}

interface HomepageEntityOrderManagerProps<TItem extends OrderableItem> {
  initialItems: TItem[];
  availableOptions: AvailableOption[];
  addPlaceholder: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  onAdd: (optionId: string) => Promise<ApiResponse<TItem>>;
  onUpdate: (id: string, data: { displayOrder?: number; isVisible?: boolean }) => Promise<ApiResponse<TItem>>;
  onRemove: (id: string) => Promise<ApiResponse<null>>;
}

function sortByDisplayOrder<TItem extends OrderableItem>(items: TItem[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Reusable "which real records show on the homepage, in what order" manager
 * — powers both the Featured Categories and Moon Essentials admin screens.
 * Mirrors the existing ImagesManager/InstagramGalleryManager interaction
 * pattern (move up/down swaps displayOrder, Eye/EyeOff toggles visibility)
 * so the admin experience stays consistent across every reorderable list in
 * the panel, but never touches the underlying Category/SubCategory records
 * themselves — only this list's own order/visibility pointer rows.
 */
export function HomepageEntityOrderManager<TItem extends OrderableItem>({
  initialItems,
  availableOptions,
  addPlaceholder,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onAdd,
  onUpdate,
  onRemove,
}: HomepageEntityOrderManagerProps<TItem>) {
  const [items, setItems] = useState(() => sortByDisplayOrder(initialItems));
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<TItem | null>(null);

  const featuredIds = new Set(items.map((item) => item.id));
  const remainingOptions = availableOptions.filter((option) => !featuredIds.has(option.id));

  async function handleAdd() {
    if (!selectedOptionId) return;
    setIsAdding(true);
    const result = await onAdd(selectedOptionId);
    setIsAdding(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Could not add to homepage.");
      return;
    }
    toast.success("Added to homepage.");
    setSelectedOptionId("");
    setItems((prev) => sortByDisplayOrder([...prev, result.data!]));
  }

  async function handleRemove(item: TItem) {
    setRemovingId(item.id);
    const result = await onRemove(item.id);
    setRemovingId(null);

    if (!result.success) {
      toast.error(result.message || "Could not remove.");
      return;
    }
    toast.success("Removed from homepage.");
    setItems((prev) => prev.filter((existing) => existing.id !== item.id));
  }

  async function handleToggleVisible(item: TItem) {
    setTogglingId(item.id);
    const result = await onUpdate(item.id, { isVisible: !item.isVisible });
    setTogglingId(null);

    if (!result.success || !result.data) {
      toast.error(result.message || "Could not update visibility.");
      return;
    }
    toast.success(item.isVisible ? "Hidden from homepage." : "Now visible on homepage.");
    setItems((prev) => prev.map((existing) => (existing.id === item.id ? result.data! : existing)));
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    const reordered = [...items];
    reordered[index] = target;
    reordered[targetIndex] = current;
    setItems(reordered);

    const [firstResult, secondResult] = await Promise.all([
      onUpdate(current.id, { displayOrder: target.displayOrder }),
      onUpdate(target.id, { displayOrder: current.displayOrder }),
    ]);

    if (!firstResult.success || !secondResult.success) {
      toast.error("Could not reorder.");
      setItems((prev) => sortByDisplayOrder(prev));
      return;
    }

    setItems((prev) =>
      sortByDisplayOrder(
        prev.map((existing) => {
          if (existing.id === current.id) return { ...existing, displayOrder: target.displayOrder };
          if (existing.id === target.id) return { ...existing, displayOrder: current.displayOrder };
          return existing;
        })
      )
    );
  }

  const EmptyIcon = emptyIcon;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={selectedOptionId}
          onValueChange={(value) => setSelectedOptionId(value ?? "")}
          disabled={remainingOptions.length === 0}
        >
          <SelectTrigger className="w-full sm:max-w-xs">
            <SelectValue placeholder={remainingOptions.length === 0 ? "All added" : addPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {remainingOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" disabled={!selectedOptionId || isAdding} onClick={handleAdd}>
          <Plus /> {isAdding ? "Adding..." : "Add"}
        </Button>
      </div>

      {items.length === 0 ? (
        <AdminEmptyState icon={EmptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border-light p-3"
            >
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL
                <img src={item.image} alt="" className="size-11 shrink-0 rounded-md object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-text-primary">{item.name}</p>
                {!item.isVisible && (
                  <Badge variant="outline" className="mt-0.5 border-transparent bg-muted text-[10px] text-text-muted">
                    Hidden
                  </Badge>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Move earlier"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Move later"
                  disabled={index === items.length - 1}
                  onClick={() => handleMove(index, 1)}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={item.isVisible ? "Hide from homepage" : "Show on homepage"}
                  disabled={togglingId === item.id}
                  onClick={() => handleToggleVisible(item)}
                >
                  {item.isVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove from homepage"
                  disabled={removingId === item.id}
                  onClick={() => setPendingRemoval(item)}
                >
                  <Trash2 className="size-3.5 text-danger" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pendingRemoval}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        title="Remove from homepage?"
        description={`"${pendingRemoval?.name}" will no longer appear on the homepage. This doesn't delete the underlying record — you can add it back anytime.`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingRemoval) return;
          await handleRemove(pendingRemoval);
          setPendingRemoval(null);
        }}
      />
    </div>
  );
}
