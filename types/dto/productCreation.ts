import { MediaType, ProductStatus } from "@/app/generated/prisma/enums";
import z from "zod";

const ProductStatusEnum = z.enum(ProductStatus);
const mediaTypeEnum = z.enum(MediaType);

const ProductCreationRequestSchema = z.object({
    sku: z.string().max(50),
    name: z.string().max(100),
    altNames: z.array(z.string().max(100)).optional(),
    description: z.string(),
    stock: z.number().int().min(0).optional(),
    status: ProductStatusEnum.optional().default("ACTIVE"),
    price: z.number().positive(),
    compareAt: z.number().positive().optional(),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    media: z.array(
        z.object({
            url: z.string().url(),
            type: mediaTypeEnum
        })
    ).optional()
});

export type ProductCreationType = z.infer<typeof ProductCreationRequestSchema>;
export { ProductCreationRequestSchema };