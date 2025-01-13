"use server"

import "server-only"

import { prisma } from "@/lib/prisma"
import { type Task } from "@prisma/client"

import { filterColumns } from "@/lib/filter-columns"
import { unstable_cache } from "@/lib/unstable-cache"

import { type GetTasksSchema } from "./validations"

export async function getTasks(input: GetTasksSchema) {
  return unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        const fromDate = input.from ? new Date(input.from) : undefined
        const toDate = input.to ? new Date(input.to) : undefined
        const advancedTable = input.flags.includes("advancedTable")

        const where = advancedTable
          ? filterColumns({
              // table: "Task",
              filters: input.filters,
              joinOperator: input.joinOperator,
            })
          : {
              AND: [
                input.title ? { title: { contains: input.title } } : {},
                input.status.length > 0 ? { status: { in: input.status } } : {},
                input.priority.length > 0
                  ? { priority: { in: input.priority } }
                  : {},
                fromDate ? { createdAt: { gte: fromDate } } : {},
                toDate ? { createdAt: { lte: toDate } } : {},
              ],
            }

        const orderBy = input.sort.map((item) => ({
          [item.id]: item.desc ? "desc" : "asc",
        }))

        const [total, tasks] = await Promise.all([
          prisma.task.count({ where }),
          prisma.task.findMany({
            where,
            orderBy: orderBy.length > 0 ? orderBy : [{ createdAt: "desc" }],
            skip: offset,
            take: input.perPage,
          }),
        ])

        const pageCount = Math.ceil(total / input.perPage)

        return {
          data: tasks,
          pageCount,
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    ["tasks", JSON.stringify(input)],
    {
      tags: ["tasks"],
    }
  )()
}

export async function getTaskStatusCounts() {
  return unstable_cache(
    async () => {
      try {
        const counts = await prisma.task.groupBy({
          by: ["status"],
          _count: true,
        })

        return counts.map((count) => ({
          status: count.status,
          count: count._count,
        }))
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    ["task-status-counts"],
    {
      tags: ["tasks"],
    }
  )()
}

export async function getTaskPriorityCounts() {
  return unstable_cache(
    async () => {
      try {
        const counts = await prisma.task.groupBy({
          by: ["priority"],
          _count: true,
        })

        return counts.map((count) => ({
          priority: count.priority,
          count: count._count,
        }))
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    ["task-priority-counts"],
    {
      tags: ["tasks"],
    }
  )()
}
