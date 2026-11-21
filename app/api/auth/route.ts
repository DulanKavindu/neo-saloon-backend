import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (body.email == null || body.password == null) {
            return NextResponse.json({
                message: "Email and password are required"
            }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                email: body.email
            }
        });
        if (!user) {
            return NextResponse.json({
                message: "User not found"
            }, { status: 404 });
        }

        if (user.status !== "ACTIVE") {
            return NextResponse.json({
                message: "Account is not active"
            }, { status: 403 });
        }

        const isPasswordValid = await compare(body.password, user.password);
        
        if (isPasswordValid) {
         await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                lastLogin: new Date()
            }
        });

            const key=process.env.JOSE_SECRET;
            const secret = new TextEncoder().encode(key);
            const token = await new jose.SignJWT({
                 email: user.email,
                 firstName: user.firstName,
                 lastName: user.lastName,
                 role: user.role,
                privileges: user.privileges,
            }).setProtectedHeader({ alg: "HS256" }).sign(secret);
          
            const response = NextResponse.json({
                message: "Login successful",
                role: user.role,
            }); 
            
            response.cookies.set({
                name: "login_token",
                value: token,
                httpOnly: true,
                secure:false,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            return response;
                }
        else {
            return NextResponse.json({
                message: "Login failed",
                
            
            });
        }
    } catch (error) {
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 });
    }
}