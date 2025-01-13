import { prisma } from "@/lib/prisma"
import type { Task } from "@prisma/client"

import { generateRandomTask } from "./utils"

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
    console.error("Error seeding tasks:", err)
    throw err
  }
}
