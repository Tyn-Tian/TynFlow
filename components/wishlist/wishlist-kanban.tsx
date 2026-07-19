"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
    Kanban,
    KanbanBoard,
    KanbanColumn,
    KanbanItem,
    KanbanOverlay,
} from "@/components/ui/kanban";
import { IconArrowBadgeDown, IconArrowBadgeRight, IconArrowBadgeUp, IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type DragStartEvent } from "@dnd-kit/core";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditWishlistDialog } from "./edit-wishlist-dialog";
import { DeleteWishlistDialog } from "./delete-wishlist-dialog";
import { wishlistApi } from "@/lib/api/wishlist-api";
import { Wishlist, WishlistKanbanItem, WishlistKanbanResponse } from "@/types/wishlist-type";
import { BaseResponse } from "@/types/type";
import { toast } from "sonner";
import { KanbanSkeleton } from "./skeleton/wishlist-kanban-skeleton";

const COLUMN_TITLES: Record<string, string> = {
    active: "Active",
    achieved: "Achieved",
    cancelled: "Cancelled",
};

export function WishlistKanban() {
    const queryClient = useQueryClient();

    const [editItem, setEditItem] = React.useState<Wishlist | null>(null);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    
    const [deleteItem, setDeleteItem] = React.useState<Wishlist | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

    const [draggedItem, setDraggedItem] = React.useState<{ id: string; startColumn: string } | null>(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ["kanban-wishlists"],
        queryFn: async () => await wishlistApi.getAll(),
    });

    const { mutate: changeStatus } = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return await wishlistApi.change(id, status);
        },
        onSuccess: () => {
            toast.success("Status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["kanban-wishlists"] });
        },
        onError: () => {
            toast.error("Failed to update status");
        },
    });

    const initialColumns = React.useMemo(() => {
        const serverData = response?.data || { active: [], achieved: [], cancelled: [] };
        const result: Record<string, WishlistKanbanItem[]> = { active: [], achieved: [], cancelled: [] };

        for (const [status, items] of Object.entries(serverData)) {
            if (Array.isArray(items)) {
                result[status] = items.map((item: WishlistKanbanItem) => ({
                    id: item.id,
                    name: item.name,
                    priority: item.priority,
                    price: item.price,
                    assignee: item.assignee,
                    created_at: item.created_at,
                    is_disabled: item.is_disabled,
                }));
            }
        }
        return result;
    }, [response?.data]);

    const handleValueChange = (newColumns: Record<string, WishlistKanbanItem[]>) => {
        queryClient.setQueryData(["kanban-wishlists"], (oldData: BaseResponse<WishlistKanbanResponse> | undefined) => {
            if (!oldData) return undefined;
            return {
                ...oldData,
                data: newColumns as unknown as WishlistKanbanResponse,
            };
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const item = Object.values(initialColumns).flat().find(i => i.id === active.id);
        if (item?.is_disabled) return;

        const startColumn = Object.keys(initialColumns).find((key) =>
            initialColumns[key].some((i) => i.id === active.id)
        );
        if (startColumn) {
            setDraggedItem({ id: active.id as string, startColumn });
        }
    };

    const handleDragEnd = () => {
        if (!draggedItem) return;
        
        const currentData = queryClient.getQueryData<BaseResponse<WishlistKanbanResponse>>(["kanban-wishlists"]);
        const finalColumns = currentData?.data as unknown as Record<string, WishlistKanbanItem[]> || initialColumns;
        
        const finalColumn = Object.keys(finalColumns).find((key) =>
            finalColumns[key].some((i) => i.id === draggedItem.id)
        );
        
        if (finalColumn && finalColumn !== draggedItem.startColumn) {
            const newStatus = COLUMN_TITLES[finalColumn];
            if (newStatus) {
                changeStatus({ id: draggedItem.id, status: newStatus });
            }
        }
        setDraggedItem(null);
    };

    if (isLoading) return <KanbanSkeleton />;

    return (
        <>
            <Kanban
                value={initialColumns}
                onValueChange={handleValueChange}
                getItemValue={(item) => item.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
            <KanbanBoard className="grid items-start gap-4 sm:grid-cols-3">
                {Object.entries(initialColumns).map(([columnValue, tasks]) => (
                    <KanbanColumn key={columnValue} value={columnValue} className="h-auto min-h-[200px]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {COLUMN_TITLES[columnValue]}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="pointer-events-none rounded-sm"
                                >
                                    {tasks.length}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 p-0.5">
                            {tasks.map((task) => (
                                <KanbanItem key={task.id} value={task.id} asHandle={!task.is_disabled} asChild>
                                    <div className={`group relative rounded-xl border bg-card p-4 shadow-sm transition-all ${task.is_disabled ? 'opacity-60 bg-muted/50 grayscale-[0.5] cursor-not-allowed' : 'hover:border-primary/20 hover:shadow-md'}`}>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                                                        {task.name}
                                                    </span>
                                                    <span className="text-sm font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                                        {formatRupiah(task.price)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline" className="px-1.5 text-muted-foreground mt-0.5">
                                                        {task.priority === "high" ? (
                                                            <IconArrowBadgeUp className="text-rose-700" />
                                                        ) : task.priority === "medium" ? (
                                                            <IconArrowBadgeRight className="text-amber-500" />
                                                        ) : (
                                                            <IconArrowBadgeDown className="text-emerald-500" />
                                                        )}
                                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                    </Badge>
                                                    
                                                    {!task.is_disabled && (
                                                        <div 
                                                            onPointerDown={(e) => e.stopPropagation()} 
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                    >
                                                                        <IconDotsVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setEditItem({ ...task, status: COLUMN_TITLES[columnValue] } as unknown as Wishlist);
                                                                            setIsEditOpen(true);
                                                                        }}
                                                                    >
                                                                        <IconEdit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-red-600 focus:text-red-600"
                                                                        onClick={() => {
                                                                            setDeleteItem(task as unknown as Wishlist);
                                                                            setIsDeleteOpen(true);
                                                                        }}
                                                                    >
                                                                        <IconTrash className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                                                {task.assignee ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-medium text-primary">
                                                            {task.assignee.charAt(0)}
                                                        </div>
                                                        <span className="line-clamp-1 font-medium">
                                                            {task.assignee}
                                                        </span>
                                                    </div>
                                                ) : <div />}
                                                {task.created_at && (
                                                    <time className="text-xs text-muted-foreground">
                                                        {formatDate(task.created_at)}
                                                    </time>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </KanbanItem>
                            ))}
                        </div>
                    </KanbanColumn>
                ))}
            </KanbanBoard>
                <KanbanOverlay>
                    <div className="size-full rounded-md bg-primary/10" />
                </KanbanOverlay>
            </Kanban>
            
            <EditWishlistDialog
                wishlist={editItem}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
            
            <DeleteWishlistDialog
                wishlist={deleteItem}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
            />
        </>
    );
}