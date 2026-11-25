import { MediaType, ProductStatus } from "@/app/generated/prisma/enums";
import z from "zod";

const ProductStatusEnum = z.enum(ProductStatus);
const mediaTypeEnum = z.enum(MediaType);

export const mediaArraySchema = z.array(
    z.object({
        url: z.string().url(),
        type: mediaTypeEnum
    })
);

const ProductUpdateRequestSchema = z.object({
    sku: z.string().max(50).optional(),
    name: z.string().max(100).optional(),
    altNames: z.array(z.string().max(100)).optional(),
    description: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    status: ProductStatusEnum.optional(),
    price: z.number().positive().optional(),
    compareAt: z.number().positive().optional(),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    media: mediaArraySchema.optional()
});

export type ProductUpdateType = z.infer<typeof ProductUpdateRequestSchema>;
export { ProductUpdateRequestSchema };