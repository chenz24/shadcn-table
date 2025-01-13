/**
 * @see https://gist.github.com/rphlmr/0d1722a794ed5a16da0fdf6652902b15
 */

import { type QueryBuilderOpts } from "@/types"
import { type Task } from "@prisma/client"
import { faker } from "@faker-js/faker"
import { customAlphabet } from "nanoid"

import { generateId } from "@/lib/id"

/**
 * Takes the first item from an array.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array.
 */
export function takeFirst<TData>(items: TData[]) {
  return items.at(0)
}

/**
 * Takes the first item from an array or returns null if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array or null.
 */
export function takeFirstOrNull<TData>(items: TData[]) {
  return takeFirst(items) ?? null
}

/**
 * Takes the first item from an array or throws an error if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array.
 * @throws {Error} If the array is empty.
 */
export function takeFirstOrThrow<TData>(items: TData[]) {
  const item = takeFirst(items)

  if (!item) {
    throw new Error("No items found")
  }

  return item
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 *
 * @param value - The value to check.
 * @returns True if the value is empty, false otherwise.
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === "string") {
    return value.trim() === ""
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * Checks if a value is not empty (not null, not undefined, not empty string, not empty array, and not empty object).
 *
 * @param value - The value to check.
 * @returns True if the value is not empty, false otherwise.
 */
export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value)
}

/**
 * Generates a random task with fake data.
 *
 * @returns A random task with fake data.
 */
export function generateRandomTask(): Task {
  return {
    id: generateId("task"),
    code: `TASK-${customAlphabet("0123456789", 4)()}`,
    title: faker.hacker
      .phrase()
      .replace(/^./, (letter) => letter.toUpperCase()),
    status: faker.helpers.arrayElement(["todo", "in_progress", "done", "canceled"]),
    label: faker.helpers.arrayElement(["bug", "feature", "enhancement", "documentation"]),
    priority: faker.helpers.arrayElement(["low", "medium", "high"]),
    archived: faker.datatype.boolean({ probability: 0.2 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
