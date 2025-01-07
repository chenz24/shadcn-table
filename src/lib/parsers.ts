import type { ExtendedSortingState, Filter } from "@/types"
import { type Row } from "@tanstack/react-table"
import { createParser } from "nuqs/server"
import { z } from "zod"

import { dataTableConfig } from "@/config/data-table"

export const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
})

/**
 * Creates a parser for TanStack Table sorting state.
 * @param originalRow The original row data to validate sorting keys against.
 * @returns A parser for TanStack Table sorting state.
 */
export const getSortingStateParser = <TData>(
  originalRow?: Row<TData>["original"]
) => {
  const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null

  return createParser<ExtendedSortingState<TData>>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(sortingItemSchema).safeParse(parsed)

        if (!result.success) return null

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null
        }

        return result.data as ExtendedSortingState<TData>
      } catch {
        return null
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc
      ),
  })
}

export const filterSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("text"),
    operator: z.enum(dataTableConfig.globalOperators),
    value: z.string().or(z.array(z.string())),
  }),
  z.object({
    id: z.string(),
    type: z.literal("number"),
    operator: z.enum(dataTableConfig.globalOperators),
    value: z.number().or(z.array(z.number())),
  }),
  z.object({
    id: z.string(),
    type: z.literal("date"),
    operator: z.enum(dataTableConfig.globalOperators),
    value: z.string().datetime().or(z.array(z.string().datetime())),
  }),
  z.object({
    id: z.string(),
    type: z.literal("select"),
    operator: z.enum(dataTableConfig.globalOperators),
    value: z.string().or(z.array(z.string())),
  }),
])

/**
 * Creates a parser for data table filters.
 * @param originalRow The original row data to create the parser for.
 * @returns A parser for data table filters state.
 */
export const getFiltersStateParser = <TData>(
  originalRow?: Row<TData>["original"]
) => {
  const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null

  return createParser<Filter<TData>[]>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        const result = z.array(filterSchema).safeParse(parsed)

        if (!result.success) return null

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null
        }

        return result.data as Filter<TData>[]
      } catch {
        return null
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id &&
          item.value === b[index]?.value &&
          item.operator === b[index]?.operator &&
          item.type === b[index]?.type
      ),
  })
}
