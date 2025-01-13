"use client"

import * as React from "react"
import type { Task } from "@prisma/client"
import { type DataTableRowAction } from "@/types"
import { type ColumnDef } from "@tanstack/react-table"
import { Ellipsis } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/handle-error"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

import { updateTask } from "../_lib/actions"
import { getPriorityIcon, getStatusIcon } from "../_lib/utils"

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Task> | null>
  >
}

export const statuses: Task["status"][] = ["todo", "in_progress", "done"];
export const priorities: Task["priority"][] = ["low", "medium", "high"];

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => <div className="w-20">{row.getValue("code")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const label = row.original.label;

        return (
          <div className="flex space-x-2">
            {label && <Badge variant="outline">{label}</Badge>}
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("title")}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<Task['status']>("status")
        const Icon = getStatusIcon(status)

        return (
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="capitalize">{status.replace("_", " ")}</span>
          </div>
        )
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue<Task["priority"]>("priority")
        const Icon = getPriorityIcon(priority)

        return (
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="capitalize">{priority}</span>
          </div>
        )
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "archived",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Archived" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.archived ? "Yes" : "No"}</Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <Ellipsis className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => {
                setRowAction({
                  type: "update",
                  row,
                })
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={row.original.status}>
                  {statuses.map((status) => {
                    const Icon = getStatusIcon(status)

                    return (
                      <DropdownMenuRadioItem
                        key={status}
                        value={status}
                        className="flex items-center gap-2"
                        onClick={async () => {
                          try {
                            await updateTask({
                              id: row.original.id,
                              status,
                            })
                            toast.success("Task updated")
                          } catch (err) {
                            toast.error(getErrorMessage(err))
                          }
                        }}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span className="capitalize">{status.replace("_", " ")}</span>
                      </DropdownMenuRadioItem>
                    )
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={row.original.priority}>
                  {priorities.map((priority) => {
                    const Icon = getPriorityIcon(priority)

                    return (
                      <DropdownMenuRadioItem
                        key={priority}
                        value={priority}
                        className="flex items-center gap-2"
                        onClick={async () => {
                          try {
                            await updateTask({
                              id: row.original.id,
                              priority,
                            })
                            toast.success("Task updated")
                          } catch (err) {
                            toast.error(getErrorMessage(err))
                          }
                        }}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span className="capitalize">{priority}</span>
                      </DropdownMenuRadioItem>
                    )
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setRowAction({
                  type: "delete",
                  row,
                })
              }}
            >
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
