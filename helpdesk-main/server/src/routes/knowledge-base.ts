import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { requireAdmin } from "../middleware/require-admin";
import { validate } from "../lib/validate";
import { z } from "zod";
import prisma from "../db";

const router = Router();

const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
});

const updateArticleSchema = createArticleSchema.partial();

// Get all articles
router.get("/", requireAuth, async (req, res) => {
  const { category } = req.query;
  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: category ? { category: String(category) } : {},
    orderBy: { createdAt: "desc" },
  });
  res.json({ articles });
});

// Get single article
router.get("/:id", requireAuth, async (req, res) => {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { id: req.params.id },
  });
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json({ article });
});

// Create article (Admin only)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const data = validate(createArticleSchema, req.body, res);
  if (!data) return;

  const article = await prisma.knowledgeBaseArticle.create({
    data,
  });
  res.status(201).json({ article });
});

// Update article (Admin only)
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const data = validate(updateArticleSchema, req.body, res);
  if (!data) return;

  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { id: req.params.id },
  });
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  const updated = await prisma.knowledgeBaseArticle.update({
    where: { id: req.params.id },
    data,
  });
  res.json({ article: updated });
});

// Delete article (Admin only)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { id: req.params.id },
  });
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  await prisma.knowledgeBaseArticle.delete({
    where: { id: req.params.id },
  });
  res.json({ message: "Article deleted" });
});

export default router;
