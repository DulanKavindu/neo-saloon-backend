import { ProductStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { checkPrivileges } from "@/utils/authentication";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest) {

       

    const params = req.nextUrl.searchParams.get("id")
    if(!params){
        return NextResponse.json({
            message:"Need to Product Id"
        })
    }
    try{
    const existing= await prisma.product.findUnique({
        where:{
            id:params
        }
    })
    if(!existing){
        return  NextResponse.json({
            massage:"Not Existing That product"
        })
    }
    if(existing.status==ProductStatus.DELETED){
        return NextResponse.json({
            message:"That Product DeLeted"
        },{status:400})
    }
    if(existing.status==ProductStatus.INACTIVE){
         const hasPrivilege=await checkPrivileges(req,["product:read"])
        if(!hasPrivilege){
           return NextResponse.json({
            message:"You haven't Privilege To Read Product"
           })

        }
         return NextResponse.json({
        massage:"product",
        product:existing
    },{status:200})

    }
    return NextResponse.json({
        massage:"product",
        product:existing
    },{status:200})
}catch(err){
    return NextResponse.json({
        message:"Sever Error"
    },{status:500})
} 
}