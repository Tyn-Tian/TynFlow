"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field"
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." }).regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const supabase = createClient()
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserAuthorization = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Failed", {
          description: "Access denied. Please use the link from your email.",
          duration: 3000
        })
        router.push('/login');
      } else {
        setIsAuthorized(true);
      }
    };

    checkUserAuthorization();
  }, [router, isAuthorized, supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Your password has been reset successfully.",
        duration: 3000
      })
      router.push("/login")
    },
    onError: (error: Error) => {
      toast.error("Failed", {
        description: error.message,
        duration: 3000
      })
    }
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    mutation.mutate(data)
  }

  if (!isAuthorized) {
    return <p className="text-center text-sm text-muted-foreground mt-4">Verifying access...</p>;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">New Password</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Resetting password...' : 'Reset Password'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
