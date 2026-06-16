"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wishlist } from "@/types/wishlist-type";
import { EditWishlistDialog } from "../edit-wishlist-dialog";
import { DeleteWishlistDialog } from "../delete-wishlist-dialog";

interface ActionCellProps {
    wishlist: Wishlist;
}

export function ActionCell({ wishlist }: ActionCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setEditOpen(true)}
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => setDeleteOpen(true)}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditWishlistDialog
                wishlist={wishlist}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
            <DeleteWishlistDialog
                wishlist={wishlist}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </div>
    );
}
