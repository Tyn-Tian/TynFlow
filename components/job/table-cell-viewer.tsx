"use client"

import * as React from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { IconCalendar } from "@tabler/icons-react"
import { Calendar } from "@/components/ui/calendar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

import { Job } from "../../repository/job-repository"
import { editJobAction } from "@/actions/job-actions"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const SOURCES = [
  "Kalibr",
  "Dealls",
  "Jobstreet",
  "LinkedIn",
  "Glints",
  "Company Website",
  "Social Media",
]

const STATUSES = [
  "Screening",
  "Fill in Information",
  "Pychotest",
  "Technical Test",
  "HR Interview",
  "User Interview",
  "Offering",
  "Rejected",
  "Accepted",
  "Other",
]

const formSchema = z.object({
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company is required"),
  source: z.string().min(1, "Source is required"),
  status: z.string().min(1, "Status is required"),
  applied_at: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
  updated_at: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
})

type FormValues = z.infer<typeof formSchema>

export function TableCellViewer({ item }: { item: Job }) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const [showAppliedDatePicker, setShowAppliedDatePicker] = React.useState(false)
  const [showUpdatedDatePicker, setShowUpdatedDatePicker] = React.useState(false)
  const appliedDatePickerRef = React.useRef<HTMLDivElement | null>(null)
  const updatedDatePickerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node
      if (showAppliedDatePicker && appliedDatePickerRef.current && !appliedDatePickerRef.current.contains(target)) {
        setShowAppliedDatePicker(false)
      }
      if (showUpdatedDatePicker && updatedDatePickerRef.current && !updatedDatePickerRef.current.contains(target)) {
        setShowUpdatedDatePicker(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowAppliedDatePicker(false)
        setShowUpdatedDatePicker(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [showAppliedDatePicker, showUpdatedDatePicker])

  const pad = (n: number) => String(n).padStart(2, "0")
  const toDisplayDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate)
      if (isNaN(d.getTime())) return ""
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    } catch {
      return ""
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: item.position,
      company: item.company,
      source: item.source,
      status: item.status,
      applied_at: toDisplayDate(item.applied_at),
      updated_at: toDisplayDate(item.updated_at),
    },
  })

  // Update form when item changes
  React.useEffect(() => {
    form.reset({
      position: item.position,
      company: item.company,
      source: item.source,
      status: item.status,
      applied_at: toDisplayDate(item.applied_at),
      updated_at: toDisplayDate(item.updated_at),
    })
  }, [item, form])

  async function handleSave(values: FormValues) {
    setLoading(true)
    try {
      const toIsoDate = (d: string) => {
        const [dd, mm, yyyy] = d.split("/")
        return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`
      }

      await editJobAction(item.id, {
        position: values.position,
        company: values.company,
        source: values.source,
        status: values.status,
        applied_at: toIsoDate(values.applied_at),
        updated_at: toIsoDate(values.updated_at),
      })

      toast.success("Success", { description: "Job updated successfully." })
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const formatDatePickerValue = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 8)
    const parts = []
    if (digits.length >= 2) {
      parts.push(digits.slice(0, 2))
      if (digits.length >= 4) {
        parts.push(digits.slice(2, 4))
        if (digits.length > 4) parts.push(digits.slice(4))
      } else if (digits.length > 2) {
        parts.push(digits.slice(2))
      }
    } else {
      parts.push(digits)
    }
    return parts.join("/")
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground cursor-pointer">
          {item.position}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.position}</DrawerTitle>
          <DrawerDescription>
            Edit job details and track your application progress.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4" id="edit-job-form" onSubmit={form.handleSubmit(() => setConfirmOpen(true))}>
            <FieldGroup className="gap-4">
              <Controller
                name="position"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-position">Position</FieldLabel>
                    <Input {...field} id="edit-position" autoComplete="off" />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="company"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-company">Company</FieldLabel>
                    <Input {...field} id="edit-company" autoComplete="off" />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="source"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-source">Source</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="edit-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOURCES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-status">Status</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="applied_at"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-applied-at">Applied At</FieldLabel>
                    <div className="relative" ref={appliedDatePickerRef}>
                      <div className="flex items-center">
                        <Input
                          id="edit-applied-at"
                          value={field.value}
                          onChange={(e) => field.onChange(formatDatePickerValue(e.target.value))}
                          autoComplete="off"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAppliedDatePicker(!showAppliedDatePicker)}
                          className="w-9 h-10 flex items-center justify-center ml-2 cursor-pointer"
                        >
                          <IconCalendar />
                        </button>
                      </div>
                      {showAppliedDatePicker && (
                        <div className="absolute z-50 mt-2">
                          <Calendar
                            mode="single"
                            selected={(() => {
                              const [dd, mm, yyyy] = field.value.split("/")
                              const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
                              return isNaN(d.getTime()) ? undefined : d
                            })()}
                            onSelect={(d) => {
                              if (!d) return
                              const dd = pad(d.getDate())
                              const mm = pad(d.getMonth() + 1)
                              const yyyy = d.getFullYear()
                              field.onChange(`${dd}/${mm}/${yyyy}`)
                              setShowAppliedDatePicker(false)
                            }}
                            className="rounded-lg border bg-background"
                          />
                        </div>
                      )}
                    </div>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="updated_at"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-updated-at">Updated At</FieldLabel>
                    <div className="relative" ref={updatedDatePickerRef}>
                      <div className="flex items-center">
                        <Input
                          id="edit-updated-at"
                          value={field.value}
                          onChange={(e) => field.onChange(formatDatePickerValue(e.target.value))}
                          autoComplete="off"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUpdatedDatePicker(!showUpdatedDatePicker)}
                          className="w-9 h-10 flex items-center justify-center ml-2 cursor-pointer"
                        >
                          <IconCalendar />
                        </button>
                      </div>
                      {showUpdatedDatePicker && (
                        <div className="absolute z-50 mt-2">
                          <Calendar
                            mode="single"
                            selected={(() => {
                              const [dd, mm, yyyy] = field.value.split("/")
                              const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
                              return isNaN(d.getTime()) ? undefined : d
                            })()}
                            onSelect={(d) => {
                              if (!d) return
                              const dd = pad(d.getDate())
                              const mm = pad(d.getMonth() + 1)
                              const yyyy = d.getFullYear()
                              field.onChange(`${dd}/${mm}/${yyyy}`)
                              setShowUpdatedDatePicker(false)
                            }}
                            className="rounded-lg border bg-background"
                          />
                        </div>
                      )}
                    </div>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DrawerFooter>
          <Button type="submit" form="edit-job-form">Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan pada data pekerjaan ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={form.handleSubmit(handleSave)} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  )
}
