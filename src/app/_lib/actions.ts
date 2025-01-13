"use server"

import { revalidateTag, unstable_noStore } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { Task } from "@prisma/client"
import { customAlphabet } from "nanoid"

import { getErrorMessage } from "@/lib/handle-error"

import { generateRandomTask } from "./utils"
import type { CreateTaskSchema, UpdateTaskSchema } from "./validations"

export async function seedTasks(input: { count: number }) {
  const count = input.count ?? 100

  try {
    const allTasks: Task[] = []

    for (let i = 0; i < count; i++) {
      allTasks.push(generateRandomTask())
    }

    await prisma.task.deleteMany()

    console.log("📝 Inserting tasks", allTasks.length)

    await prisma.task.createMany({
      data: allTasks,
      skipDuplicates: true,
    })
  } catch (err) {
    console.error(err)
  }
}

export async function createTask(input: CreateTaskSchema) {
  unstable_noStore()
  try {
    const newTask = await prisma.task.create({
      data: {
        code: `TASK-${customAlphabet("0123456789", 4)()}`,
        title: input.title,
        status: input.status,
        label: input.label,
        priority: input.priority,
      },
    })

    revalidateTag("tasks")
    revalidateTag("task-status-counts")
    revalidateTag("task-priority-counts")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateTask(input: UpdateTaskSchema & { id: string }) {
  unstable_noStore()
  try {
    const updatedTask = await prisma.task.update({
      where: { id: input.id },
      data: {
        title: input.title,
        status: input.status,
        label: input.label,
        priority: input.priority,
      },
    })

    revalidateTag("tasks")
    if (updatedTask.status === input.status) {
      revalidateTag("task-status-counts")
    }
    if (updatedTask.priority === input.priority) {
      revalidateTag("task-priority-counts")
    }

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateTasks(input: {
  ids: string[]
  label?: Task["label"]
  status?: Task["status"]
  priority?: Task["priority"]
}) {
  unstable_noStore()
  try {
    const updatedTasks = await prisma.task.updateMany({
      where: {
        id: {
          in: input.ids,
        },
      },
      data: {
        label: input.label,
        status: input.status,
        priority: input.priority,
      },
    })

    revalidateTag("tasks")
    if (input.status) {
      revalidateTag("task-status-counts")
    }
    if (input.priority) {
      revalidateTag("task-priority-counts")
    }

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteTask(input: { id: string }) {
  unstable_noStore()
  try {
    await prisma.task.delete({
      where: { id: input.id },
    })

    await prisma.task.create({
      data: generateRandomTask(),
    })

    revalidateTag("tasks")
    revalidateTag("task-status-counts")
    revalidateTag("task-priority-counts")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteTasks(input: { ids: string[] }) {
  unstable_noStore()
  try {
    await prisma.task.deleteMany({
      where: {
        id: {
          in: input.ids,
        },
      },
    })

    await prisma.task.createMany({
      data: input.ids.map(() => generateRandomTask()),
    })

    revalidateTag("tasks")
    revalidateTag("task-status-counts")
    revalidateTag("task-priority-counts")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}
