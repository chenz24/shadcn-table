import * as React from "react"
import type { Task } from "@prisma/client"
import { SelectTrigger } from "@radix-ui/react-select"
import { type Table } from "@tanstack/react-table"
import {
  ArrowUp,
  CheckCircle2,
  Download,
  Loader,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { exportTableToCSV } from "@/lib/export"
import { Button } from "@/components/ui/button"
import { Portal } from "@/components/ui/portal"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd } from "@/components/kbd"

import { deleteTasks, updateTasks } from "../_lib/actions"

interface TasksTableFloatingBarProps {
  table: Table<Task>
}

export function TasksTableFloatingBar({ table }: TasksTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const [isPending, startTransition] = React.useTransition()
  const [action, setAction] = React.useState<
    "update-status" | "update-priority" | "export" | "delete"
  >()

  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [table])

  return (
    <Portal>
      <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-fit items-center gap-4 rounded-lg bg-background px-4 py-2 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            Selected
            <span className="rounded bg-muted px-1 text-muted-foreground">
              {rows.length}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => table.toggleAllRowsSelected(false)}
              >
                <X className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Clear selection</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear selection</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-2">
          <Select
            value={action === "update-status" ? "status" : undefined}
            onValueChange={() => setAction("update-status")}
          >
            <SelectTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                Status
                <ArrowUp className="ml-2 size-3" aria-hidden="true" />
              </Button>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {["todo", "in_progress", "done"].map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    onClick={() => {
                      startTransition(() => {
                        toast.promise(
                          updateTasks({
                            ids: rows.map((row) => row.original.id),
                            status: status as Task["status"],
                          }),
                          {
                            loading: "Updating...",
                            success: () => {
                              setAction(undefined)
                              table.toggleAllRowsSelected(false)
                              return "Status updated"
                            },
                            error: "Error updating status",
                          }
                        )
                      })
                    }}
                  >
                    <span className="capitalize">{status.replace("_", " ")}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={action === "update-priority" ? "priority" : undefined}
            onValueChange={() => setAction("update-priority")}
          >
            <SelectTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                Priority
                <ArrowUp className="ml-2 size-3" aria-hidden="true" />
              </Button>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {["low", "medium", "high"].map((priority) => (
                  <SelectItem
                    key={priority}
                    value={priority}
                    onClick={() => {
                      startTransition(() => {
                        toast.promise(
                          updateTasks({
                            ids: rows.map((row) => row.original.id),
                            priority: priority as Task["priority"],
                          }),
                          {
                            loading: "Updating...",
                            success: () => {
                              setAction(undefined)
                              table.toggleAllRowsSelected(false)
                              return "Priority updated"
                            },
                            error: "Error updating priority",
                          }
                        )
                      })
                    }}
                  >
                    <span className="capitalize">{priority}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={isPending}
                onClick={() => {
                  setAction("export")
                  startTransition(() => {
                    try {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-expect-error
                      exportTableToCSV(rows, "tasks.csv")
                      toast.success("Tasks exported")
                    } catch (error) {
                      toast.error("Error exporting tasks")
                    } finally {
                      setAction(undefined)
                    }
                  })
                }}
              >
                {isPending && action === "export" ? (
                  <Loader className="size-3 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-3" aria-hidden="true" />
                )}
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Export as CSV
              <Kbd>⌘E</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isPending}
              onClick={() => {
                setAction("delete")
                startTransition(() => {
                  toast.promise(
                    deleteTasks({
                      ids: rows.map((row) => row.original.id),
                    }),
                    {
                      loading: "Deleting...",
                      success: () => {
                        setAction(undefined)
                        table.toggleAllRowsSelected(false)
                        return "Tasks deleted"
                      },
                      error: "Error deleting tasks",
                    }
                  )
                })
              }}
            >
              {isPending && action === "delete" ? (
                <Loader className="size-3 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-3" aria-hidden="true" />
              )}
              Delete
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Delete
            <Kbd>⌘⌫</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </Portal>
  )
}
