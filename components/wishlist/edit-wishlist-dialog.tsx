"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Wishlist, WishlistDto } from "@/types/wishlist-type";
import { wishlistApi } from "@/lib/api/wishlist-api";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    priority: z.enum(["Low", "Medium", "High"]),
    status: z.enum(["Active", "Achieved", "Cancelled"]),
    price: z.number().int().min(0, "Price must be at least 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditWishlistDialogProps {
    wishlist: Wishlist | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditWishlistDialog({ wishlist, open, onOpenChange }: EditWishlistDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            priority: "Medium",
            status: "Active",
            price: 0,
        },
    });

    useEffect(() => {
        if (wishlist && open) {
            form.reset({
                name: wishlist.name,
                priority: wishlist.priority,
                status: wishlist.status,
                price: wishlist.price,
            });
        }
    }, [wishlist, open, form]);

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            form.reset();
        }
    };

    const mutation = useMutation({
        mutationFn: async (dto: WishlistDto) => {
            if (!wishlist) throw new Error("No wishlist selected");
            return await wishlistApi.update(wishlist.id, dto);
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Wishlist updated.",
                duration: 3000,
            });
            handleOpenChange(false);
            queryClient.invalidateQueries({
                queryKey: ["wishlists"],
            });
        },
        onError: (err: Error | unknown) => {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
                duration: 3000,
            });
        },
    });

    async function onSubmit(values: FormValues) {
        mutation.mutate(values);
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Wishlist</AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-6">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="edit-wishlist-name">Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id="edit-wishlist-name"
                                        placeholder="Item name"
                                        autoComplete="off"
                                    />
                                    {fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="priority"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Priority</FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(v) => field.onChange(v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="status"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Status</FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(v) => field.onChange(v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Achieved">Achieved</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="price"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="edit-wishlist-price">Price</FieldLabel>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={
                                                field.value !== undefined && field.value !== null
                                                    ? field.value.toLocaleString("id-ID")
                                                    : ""
                                            }
                                            id="edit-wishlist-price"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            onChange={(event) =>
                                                field.onChange(
                                                    Number(event.target.value.replace(/\D/g, ""))
                                                )
                                            }
                                            className="flex-1"
                                        />
                                    </div>
                                    {fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" className="cursor-pointer">
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="cursor-pointer"
                            >
                                {mutation.isPending ? "Saving..." : "Save"}
                            </Button>
                        </AlertDialogFooter>
                    </FieldGroup>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
