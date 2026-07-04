"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/wishlist/table/data-table";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";

import { AddWishlistDialog } from "@/components/wishlist/add-wishlist-dialog";
import { columns } from "@/components/wishlist/table/columns";
import { WishlistTableSkeleton } from "@/components/wishlist/skeleton/wishlist-table-skeleton";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { wishlistApi } from "@/lib/api/wishlist-api";

export default function Page() {
    const { data, isLoading } = useQuery({
        queryKey: ["wishlists"],
        queryFn: async () => await wishlistApi.getAll(),
    });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [priority, setPriority] = useState<string>("all");
    const [status, setStatus] = useState<string>("all");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const filteredData = useMemo(() => {
        if (!data) return [];
        let filtered = data;

        if (debouncedSearch) {
            const lowerSearch = debouncedSearch.toLowerCase();
            filtered = filtered.filter((item) =>
                item.name.toLowerCase().includes(lowerSearch)
            );
        }

        if (priority !== "all") {
            filtered = filtered.filter((item) => item.priority === priority);
        }

        if (status !== "all") {
            filtered = filtered.filter((item) => item.status === status);
        }

        return filtered;
    }, [data, debouncedSearch, priority, status]);

    return (
        <>
            <SiteHeader title="Wishlist" />
            <section className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-4 w-full">
                        <div className="flex-1 min-w-[150px] order-1 md:flex-none md:w-[250px]">
                            <Input
                                placeholder="Search wishlist..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="order-2 md:order-3 md:ml-auto">
                            <AddWishlistDialog />
                        </div>

                        <div className="w-full order-3 md:order-2 md:w-auto grid grid-cols-2 md:flex gap-2 items-center md:mt-0">
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="w-full md:w-[140px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full md:w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Achieved">Achieved</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {isLoading ? (
                        <WishlistTableSkeleton />
                    ) : (
                        <DataTable columns={columns} data={filteredData} />
                    )}
                </div>
            </section>
        </>
    );
}