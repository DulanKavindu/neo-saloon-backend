import prisma from "@/lib/prisma";
import { checkPrivileges, getUser } from "@/utils/authentication";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {

    const check= await checkPrivileges(req,["users:read"])
    if (!check) {
        return NextResponse.json({
            message:"User not authorized to access this resource"
        },{status:403})
    
    }
    const users = await prisma.user.findMany()
    
    return NextResponse.json({
        message:"all users",
        users:users
    },{status:200})
}
    
export async function POST(req:NextRequest) {


    const body = await req.json();
    if (!body.email || !body.firstName || !body.lastName || !body.password ) {
        return NextResponse.json({
            message:"Missing required fields"
        },{status:400})
    }
    const existingUser = await prisma.user.findUnique({ 
        
            where:{
                email:body.email
            }
        
    })
    if (existingUser) {
        return NextResponse.json({
            message:"User already exists"
        },{status:400})
    }
    const hashPassword = await bcrypt.hash(body.password,10);
    const newUser = await prisma.user.create({
        data:{  
            email:body.email,
            firstName:body.firstName,
            lastName:body.lastName,
            password:hashPassword,
            phone:body.phone||null
        }
    })
    return NextResponse.json({  
        massage:"User created successfully",
    })
}