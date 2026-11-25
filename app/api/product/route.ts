import { NextRequest, NextResponse } from "next/server";
import { checkPrivileges, getUser } from "@/utils/authentication";
import { ProductCreationRequestSchema } from "@/types/dto/productCreation";
import z from "zod";
import prisma from "@/lib/prisma";


export async function GET(req: NextRequest) {

  const user = await getUser(req);
    
  if (!user) {
    return NextResponse.json({
      message: "User not authenticated",
    }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  const hasPrivileges = await checkPrivileges(req, ["product:add"]);

  if (hasPrivileges) {
    try {
      const body = await req.json();
      const validatedData = ProductCreationRequestSchema.parse(body);

      const product = await prisma.product.create({
        data: {
          sku: validatedData.sku,
          name: validatedData.name,
          altNames: validatedData.altNames || [],
          description: validatedData.description,
          stock: validatedData.stock ?? 0,
          status: validatedData.status || undefined,
          price: validatedData.price,
          compareAt: validatedData.compareAt ?? null,
          brand: validatedData.brand ?? null,
          model: validatedData.model ?? null,
          media: validatedData.media
            ? {
                create: validatedData.media,
              }
            : undefined,
        },
        include: {
          media: true,
        },
      });

      return NextResponse.json(
        {
          message: "Product created successfully",
          product: product,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            message: error.issues[0]?.message ?? "Invalid product data",
          },
          { status: 400 }
        );
      }

      console.error("Create product error:", error);
      return NextResponse.json(
        {
          message: "Server Error",
        },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      {
        message: "You don't have privileges to add product",
      },
      { status: 403 }
    );
  }
}