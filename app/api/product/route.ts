import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";


export async function GET(req: NextRequest) {
    const login_token = req.cookies.getAll("login_token")[0]?.value;

    const key = process.env.JOSE_SECRET;
    const secret = new TextEncoder().encode(key);
    const user = await jose.jwtVerify(login_token, secret);
    console.log(user)
    
    return NextResponse.json({
        message: "User is logged in",
        user: user.payload,
    }); 
}