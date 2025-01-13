import type { Task } from "@prisma/client"
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"

const Status = z.enum(["todo", "in_progress", "done", "canceled"])
const Label = z.enum(["bug", "feature", "enhancement", "documentation"])
const Priority = z.enum(["low", "medium", "high"])

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    []
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Task>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  status: parseAsArrayOf(Status).withDefault([]),
  priority: parseAsArrayOf(Priority).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export const createTaskSchema = z.object({
  title: z.string(),
  label: Label,
  status: Status,
  priority: Priority,
})

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  label: Label.optional(),
  status: Status.optional(),
  priority: Priority.optional(),
})

export type GetTasksSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>
export type CreateTaskSchema = z.infer<typeof createTaskSchema>
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>
