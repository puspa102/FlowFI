import express from 'express'
import prisma from '../config/prisma'
import { ensureBudgetData } from '../services/demoDataService'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

const router = express.Router()

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id
    await ensureBudgetData(userId)

    const customCategories = await prisma.budgetCategory.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    })

    const categories = customCategories.map((c) => ({
      id: c.id,
      value: c.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
      label: c.name,
      icon: c.icon ?? 'HelpCircle',
      tone: c.tone ?? 'slate',
    }))

    res.status(200).json({ categories })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id
    const { name, icon, tone } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' })
    }

    const newCategory = await prisma.budgetCategory.create({
      data: {
        userId,
        name,
        icon: icon ?? 'HelpCircle',
        tone: tone ?? 'slate',
      },
    })

    res.status(201).json({
      category: {
        id: newCategory.id,
        value: newCategory.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        label: newCategory.name,
        icon: newCategory.icon,
        tone: newCategory.tone,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID.' })
    }

    const category = await prisma.budgetCategory.findFirst({
      where: { id, userId },
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' })
    }

    // Delete budgets associated with this category
    await prisma.budget.deleteMany({
      where: { categoryId: id },
    })

    await prisma.budgetCategory.delete({
      where: { id },
    })

    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

export default router

