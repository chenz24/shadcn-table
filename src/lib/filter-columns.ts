import type { Filter, JoinOperator } from "@/types"
import { addDays, endOfDay, startOfDay } from "date-fns"
import { type Prisma } from "@prisma/client"

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
 * @param filters - An array of filters to be applied.
 * @param joinOperator - The join operator to use for combining the filters.
 * @returns A Prisma where condition representing the combined filters.
 */
export function filterColumns({
  filters,
  joinOperator,
}: {
  filters: Filter<any>[]
  joinOperator: JoinOperator
}): WhereInput {
  const conditions = filters.map((filter): WhereInput | undefined => {
    const { id, value, operator, type } = filter
    switch (operator) {
      case "equals":
        if (Array.isArray(value)) {
          return { [id]: { in: value } }
        } else if (type === 'boolean' && typeof value === 'string' ) {
          return { [id]: filter.value === "true" };
        } else if (type === 'date') {
          const date = new Date(value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          return { [id]: { gte: start, lte: end } };
        }
        return { [id]: { equals: value } }
      case "not-equals":
        if (Array.isArray(value)) {
          return { [id]: { notIn: value } }
        } else if (type === 'boolean') {
          return { [id]: { not: filter.value === "true" } };
        } else if (filter.type === "date") {
          const date = new Date(value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          return { OR: [{ [id]: { lt: start } }, { [id]: { gt: end } }] };
        }
        return { [id]: { not: value } }
      case "contains":
        return { [id]: { contains: value, mode: "insensitive" } }
      case "not-contains":
        return { [id]: { not: { contains: value } } }
      case "greater-than":
        if (type === "date" && typeof value === "string") {
          return { [id]: { gt: startOfDay(new Date(value)) } }
        }
        return { [id]: { gt: value } }
      case "greater-than-or-equals":
        return filter.type === "number"
          ? { [id]: { gte: filter.value } }
          : filter.type === "date" && typeof filter.value === "string"
            ? { [id]: { gte: startOfDay(new Date(filter.value)) } }
            : undefined;
      case "less-than":
        return filter.type === "number"
          ? { [id]: { lt: filter.value } }
          : filter.type === "date" && typeof filter.value === "string"
            ? { [id]: { lt: endOfDay(new Date(filter.value)) } }
            : undefined;
      case "less-than-or-equals":
        return filter.type === "number"
          ? { [id]: { lte: filter.value } }
          : filter.type === "date" && typeof filter.value === "string"
            ? { [id]: { lte: endOfDay(new Date(filter.value)) } }
            : undefined;
      case "in":
        return { [id]: { in: value } }
      case "not-in":
        return { [id]: { notIn: value } }
      case "between": {
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          return filter.type === "date" ? {
              AND: [
                filter.value[0] ? { [id]: { gte: startOfDay(new Date(filter.value[0])) } } : undefined,
                filter.value[1] ? { [id]: { lte: endOfDay(new Date(filter.value[1])) } } : undefined,
              ].filter(Boolean),
            }
            : {
              AND: [
                { [id]: { gte: filter.value[0] } },
                { [id]: { lte: filter.value[1] } },
              ],
            };
        }
        return undefined;
      }
      case "not-between": {
        const [start, end] = value as [string, string]
        if (type === "date") {
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

  const validConditions = conditions.filter((condition) => condition !== undefined);

  if (validConditions.length === 0) {
    return {}
  }

  console.log('validConditions', validConditions)

  return {
    [joinOperator === "and" ? "AND" : "OR"]: validConditions,
  }
}
