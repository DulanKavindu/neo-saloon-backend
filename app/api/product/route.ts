import { NextRequest, NextResponse } from "next/server";
import { checkPrivileges, getUser } from "@/utils/authentication";
import { ProductCreationRequestSchema } from "@/types/dto/productCreation";
import z from "zod";
import prisma from "@/lib/prisma";
import pageCountSize from "@/utils/pageCount";
import { ProductStatus } from "@/app/generated/prisma/enums";
import { mediaArraySchema, ProductUpdateRequestSchema } from "@/types/dto/productUpdate";


export async function GET(req: NextRequest) {
  try {
    const hasPrivileges = await checkPrivileges(req, ["product:read"]);
    const params = pageCountSize(req);

    if (hasPrivileges) {
      const totalProduct = await prisma.product.count({
        where: {
          NOT: {
            status: ProductStatus.DELETED,
          },
        },
      });

      const totalPage = Math.ceil(totalProduct / params.pageSize);

      const product = await prisma.product.findMany({
        where: {
          NOT: {
            status: ProductStatus.DELETED,
          },
        },
        skip: (params.pageNumber - 1) * params.pageSize,
        take: params.pageSize,
        include: {
          media: true,
        },
      });

      return NextResponse.json(
        {
          message: "All Products",
          product: product,
          pagination: {
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
            totalPage: totalPage,
            totalProduct: totalProduct,
          },
        },
        { status: 200 }
      );
    } else {
      const totalProductInNotPrivilege = await prisma.product.count({
        where: {
          status: ProductStatus.ACTIVE,
        },
      });

      const totalPageInNotPrivilege = Math.ceil(
        totalProductInNotPrivilege / params.pageSize
      );

      const product = await prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
        },
        skip: (params.pageNumber - 1) * params.pageSize,
        take: params.pageSize,
        include: {
          media: true,
        },
      });

      return NextResponse.json(
        {
          message: "All Active Products",
          product: product,
          pagination: {
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
            totalPage: totalPageInNotPrivilege,
            totalProduct: totalProductInNotPrivilege,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        message: "Server Error",
      },
      { status: 500 }
    );
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

export async function DELETE(req:NextRequest){

  const hasPrivilege= await checkPrivileges(req,["product:delete"])
  if(!hasPrivilege){
    return NextResponse.json({
      massage:"You haven't Privilege to Delete Product "
    },{status:403})
  }
  const id=req.nextUrl.searchParams.get("id")
  if(!id)
  {
    return NextResponse.json({
      massage:"Product Id required"
    },{
      status:400
    })
  }
  try{
  const existingProduct=await prisma.product.findUnique({
    where:{
      id:id
    }
  })
  if(!existingProduct){
    return NextResponse.json({
      massage:"That Product is Not existing"
    },{status:401})
  }
  
    await prisma.product.update({
      where:{
        id:id
      },
      data:{
        status:ProductStatus.DELETED
      }
    })
  return NextResponse.json({
    massage:"Product Deleted"
  },{status:201})
}catch(error)
{
  return NextResponse.json({
    massage:"Server Error"
  },{status:500})
}

}
export async function PUT(req: NextRequest) {
  const hasPrivilege = await checkPrivileges(req, ["product:edit"]);
  if (!hasPrivilege) {
    return NextResponse.json(
      {
        message: "You haven't privilege to update product",
      },
      { status: 403 }
    );
  }

  try {
    const productId = req.nextUrl.searchParams.get("id");
    if (!productId) {
      return NextResponse.json(
        {
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = ProductUpdateRequestSchema.parse(body);

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          message: "That product is not existing",
        },
        { status: 404 }
      );
    }
    if(existingProduct.status==ProductStatus.DELETED){
      return NextResponse.json({
        message:"Can't Edit Delete Product"
      },{status:403})

    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        sku: validatedData.sku ?? existingProduct.sku,
        name: validatedData.name ?? existingProduct.name,
        altNames: validatedData.altNames ?? existingProduct.altNames ?? [],
        description: validatedData.description ?? existingProduct.description,
        stock: validatedData.stock ?? existingProduct.stock,
        status: validatedData.status ?? existingProduct.status,
        price: validatedData.price ?? existingProduct.price,
        compareAt: validatedData.compareAt ?? existingProduct.compareAt,
        brand: validatedData.brand ?? existingProduct.brand,
        model: validatedData.model ?? existingProduct.model,
      },
    });

    if (validatedData.media != null) {
      const validateMediaArray = mediaArraySchema.parse(validatedData.media);
      await prisma.media.deleteMany({
        where: {
          productId: productId,
        },
      });
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          media: {
            create: validateMediaArray,
          },
        },
      });
    }

    return NextResponse.json(
      {
        message: "Product Updated",
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: err.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}