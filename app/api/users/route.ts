import prisma from "@/lib/prisma";
import { checkPrivileges, getUser } from "@/utils/authentication";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { userSelfUpdateSchema } from "@/types/dto/userSelfeUpdate";
import { userRegistrationSchema } from "@/types/dto/userRegistration"; 
import z from "zod";
import { userUpdateAdminSchema } from "@/types/dto/userUpdateAdmin";

export async function GET(req:NextRequest) {

    const check= await checkPrivileges(req,["users:read"])
    if (!check) {
        return NextResponse.json({
            message:"User not authorized to access this resource"
        },{status:403})
    
    }
    const pageNumberInString = req.nextUrl.searchParams.get("pageNumber") 
    const pageSizeInString = req.nextUrl.searchParams.get("pageSize")

    const pageNumber = pageNumberInString ? parseInt(pageNumberInString) : 1;
    const pageSize = pageSizeInString ? parseInt(pageSizeInString) : 10;

    const userCount= await prisma.user.count();
    const pageCount = Math.ceil(userCount / pageSize);
    if(pageCount<pageNumber){
        return NextResponse.json({
            massage:"page number exceed total page",
            pageCount:pageCount
        })
    }
    
    const users = await prisma.user.findMany(
        {
            skip:(pageNumber-1)*  pageSize,
            take:pageSize,
            select:{
                id:true,
                email:true,
                phone:true,
                firstName:true,
                lastName:true,
                password:false,
                role:true,
                status:true,
                lastLogin:true,
            }
        }
    )
    
    return NextResponse.json({
        message:"all users",
        users:users,
        pagination:{
            pageNumber:pageNumber,
            pageSize:pageSize,
            pageCount:pageCount
        }
    },{status:200})
}
    
export async function POST(req:NextRequest) {


    const body = await req.json();
    try{
        const parsedData = userRegistrationSchema.parse(body)
        console.log("Parsed data:", parsedData);
    
    

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
        message:"User created successfully",
    })
}catch (error) {
    if(error instanceof z.ZodError){
        return NextResponse.json({  
            massage:error.issues[0]?.message ?? "invalid input",
        },{status:400})
    }
        console.log("Validation error:", error);
        return NextResponse.json({
            message:"Invalid user data"
        },{status:400})
    }

}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const id = req.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                message: "User ID is required"
            }, { status: 400 });
        }

        const reqUser = await getUser(req);
        if (reqUser == null) {
            return NextResponse.json({
                message: "You are not logged in"
            }, { status: 401 });
        }

        if (reqUser.id == id) {
            userSelfUpdateSchema.parse(body);

            const user = await prisma.user.findUnique({
                where: {
                    id: id
                }
            });

            if (!user) {
                return NextResponse.json({
                    message: "User not found"
                }, { status: 404 });
            }

            await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    email: body.email || user.email,
                    firstName: body.firstName || user.firstName,
                    lastName: body.lastName || user.lastName,
                    phone: body.phone || user.phone,
                    profilePicture: body.profilePicture || user.profilePicture
                }
            });

            return NextResponse.json({
                message: "User updated successfully",
            });

        } else {
            const privilegeCheck = await checkPrivileges(req, ["users:update"]);
            if (!privilegeCheck) {
                return NextResponse.json({
                    message: "User not authorized to update this resource"
                }, { status: 403 });
            }

            userUpdateAdminSchema.parse(body);

            const user = await prisma.user.findUnique({
                where: {
                    id: id
                }
            });

            if (!user) {
                return NextResponse.json({
                    message: "User not found"
                }, { status: 404 });
            }

            await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    email: body.email || user.email,
                    firstName: body.firstName || user.firstName,
                    lastName: body.lastName || user.lastName,
                    phone: body.phone || user.phone,
                    profilePicture: body.profilePicture || user.profilePicture,
                    privileges: body.privileges || user.privileges,
                    role: body.role || user.role,
                    status: body.status || user.status
                }
            });

            return NextResponse.json({
                message: "User updated successfully",
            });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                message: error.issues[0]?.message ?? "Invalid input"
            }, { status: 400 });
        }
        console.error("Update user error:", error);
        return NextResponse.json({
            message: "Server error"
        }, { status: 500 });
    }
}