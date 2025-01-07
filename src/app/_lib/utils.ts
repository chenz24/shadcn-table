import type { Task } from "@prisma/client"
import { faker } from "@faker-js/faker"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircle2,
  CircleHelp,
  CircleIcon,
  CircleX,
  Timer,
} from "lucide-react"
import { customAlphabet } from "nanoid"

import { generateId } from "@/lib/id"

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

/**
 * Returns the appropriate status icon based on the provided status.
 * @param status - The status of the task.
 * @returns A React component representing the status icon.
 */
export function getStatusIcon(status: Task["status"]) {
  const statusIcons = {
    canceled: CircleX,
    done: CheckCircle2,
    in_progress: Timer,
    todo: CircleHelp,
  }

  return statusIcons[status] || CircleIcon
}

/**
 * Returns the appropriate priority icon based on the provided priority.
 * @param priority - The priority of the task.
 * @returns A React component representing the priority icon.
 */
export function getPriorityIcon(priority: Task["priority"]) {
  const priorityIcons = {
    high: ArrowUpIcon,
    medium: ArrowRightIcon,
    low: ArrowDownIcon,
  }

  return priorityIcons[priority] || ArrowRightIcon
}
