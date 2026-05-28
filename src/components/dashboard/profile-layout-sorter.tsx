"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProfileSection = {
  id: string;
  label: string;
  visible?: boolean;
};

export function ProfileLayoutSorter({
  sections,
  labels,
}: {
  sections: ProfileSection[];
  labels: {
    visible: string;
    dragHandle: string;
  };
}) {
  const [items, setItems] = useState(sections);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);
      return arrayMove(currentItems, oldIndex, newIndex);
    });
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="grid gap-3">
          {items.map((section, index) => (
            <SortableProfileSection
              index={index}
              key={section.id}
              labels={labels}
              section={section}
              setItems={setItems}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableProfileSection({
  section,
  index,
  labels,
  setItems,
}: {
  section: ProfileSection;
  index: number;
  labels: {
    visible: string;
    dragHandle: string;
  };
  setItems: Dispatch<SetStateAction<ProfileSection[]>>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-container-low p-4 transition-shadow sm:flex-row sm:items-center sm:justify-between",
        isDragging && "z-10 shadow-[0_18px_50px_rgba(0,0,0,0.12)]",
      )}
      ref={setNodeRef}
      style={style}
    >
      <input name="section_order" type="hidden" value={section.id} />
      <div className="flex items-center gap-3">
        <button
          aria-label={labels.dragHandle}
          className="inline-flex h-8 w-8 touch-none cursor-grab items-center justify-center rounded-lg border border-border-subtle bg-surface-offwhite text-muted transition-colors active:cursor-grabbing hover:text-primary"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="h-4 w-4" />
        </button>
        <Badge>{index + 1}</Badge>
        <span className="text-sm font-medium">{section.label}</span>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          checked={section.visible ?? true}
          name="section_visible"
          onChange={(event) => {
            setItems((currentItems) =>
              currentItems.map((item) =>
                item.id === section.id ? { ...item, visible: event.target.checked } : item,
              ),
            );
          }}
          type="checkbox"
          value={section.id}
        />
        {labels.visible}
      </label>
    </div>
  );
}
