import { z } from "zod";

export const productInsertSchema = z.object({
  model: z.string().min(1, "Model is required"),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  generation: z.string().optional(),
  description: z.string().optional(),
  seriesId: z.string().optional(),
  specifications: z.any().optional(),
  defaultIp: z.string().optional(),
  defaultUsername: z.string().optional(),
  defaultPassword: z.string().optional(),
  releaseDate: z.date().optional(),
  eolDate: z.date().optional(),
  visibility: z.enum(["draft", "public", "private"]).optional(),
});

export type ProductInsertInput = z.infer<typeof productInsertSchema>;

export const productUpdateSchema = productInsertSchema
  .extend({
    id: z.string().uuid("Invalid product ID"),
  })
  .partial()
  .required({ id: true });

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
