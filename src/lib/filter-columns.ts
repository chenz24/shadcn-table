import type { Filter, JoinOperator } from "@/types"
import { addDays, endOfDay, startOfDay } from "date-fns"
import { Prisma } from "@prisma/client"

type WhereInput = Prisma.TaskWhereInput

/**
 * Construct Prisma where conditions based on the provided filters.
 *
 * This function takes a table name and an array of filters, and returns a where
 * condition that represents the logical combination of these conditions. The conditions
 * are combined using the specified join operator (either 'AND' or 'OR').
 *
 * Each filter can specify various operators (e.g., equality, inequality,
 * comparison for numbers and dates, etc.) and the function will generate the appropriate
 * Prisma conditions based on the filter's type and value.
 *
 * @param table - The table name to apply the filters on.
 * @param filters - An array of filters to be applied.
 * @param joinOperator - The join operator to use for combining the filters.
 * @returns A Prisma where condition representing the combined filters.
 */
export function filterColumns({
  table,
  filters,
  joinOperator,
}: {
  table: string
  filters: Filter<Prisma.Task>[]
  joinOperator: JoinOperator
}): WhereInput {
  const conditions = filters.map((filter): WhereInput => {
    const { id, value, operator } = filter

    switch (operator) {
      case "equals":
        // 如果是数组，使用 in 操作符
        if (Array.isArray(value)) {
          return { [id]: { in: value } }
        }
        return { [id]: { equals: value } }
      case "not-equals":
        // 如果是数组，使用 notIn 操作符
        if (Array.isArray(value)) {
          return { [id]: { notIn: value } }
        }
        return { [id]: { not: value } }
      case "contains":
        return { [id]: { contains: value, mode: "insensitive" } }
      case "not-contains":
        return { [id]: { not: { contains: value, mode: "insensitive" } } }
      case "greater-than":
        return { [id]: { gt: value } }
      case "greater-than-or-equals":
        return { [id]: { gte: value } }
      case "less-than":
        return { [id]: { lt: value } }
      case "less-than-or-equals":
        return { [id]: { lte: value } }
      case "in":
        return { [id]: { in: value } }
      case "not-in":
        return { [id]: { notIn: value } }
      case "between": {
        const [start, end] = value as [string, string]
        if (id === "createdAt") {
          return {
            AND: [
              { [id]: { gte: startOfDay(new Date(start)) } },
              { [id]: { lte: endOfDay(new Date(end)) } },
            ],
          }
        }
        return {
          AND: [
            { [id]: { gte: start } },
            { [id]: { lte: end } },
          ],
        }
      }
      case "not-between": {
        const [start, end] = value as [string, string]
        if (id === "createdAt") {
          return {
            OR: [
              { [id]: { lt: startOfDay(new Date(start)) } },
              { [id]: { gt: endOfDay(new Date(end)) } },
            ],
          }
        }
        return {
          OR: [
            { [id]: { lt: start } },
            { [id]: { gt: end } },
          ],
        }
      }
      case "is-empty":
        return { [id]: null }
      case "is-not-empty":
        return { [id]: { not: null } }
      case "is-today":
        return {
          AND: [
            { [id]: { gte: startOfDay(new Date()) } },
            { [id]: { lte: endOfDay(new Date()) } },
          ],
        }
      case "is-tomorrow": {
        const tomorrow = addDays(new Date(), 1)
        return {
          AND: [
            { [id]: { gte: startOfDay(tomorrow) } },
            { [id]: { lte: endOfDay(tomorrow) } },
          ],
        }
      }
      case "is-next-7-days": {
        const today = new Date()
        const next7Days = addDays(today, 7)
        return {
          AND: [
            { [id]: { gte: startOfDay(today) } },
            { [id]: { lte: endOfDay(next7Days) } },
          ],
        }
      }
      default:
        return {}
    }
  })

  if (conditions.length === 0) {
    return {}
  }

  return {
    [joinOperator === "and" ? "AND" : "OR"]: conditions,
  }
}
