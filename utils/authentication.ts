import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

export  async function getUser(req: NextRequest) {
const login_token = req.cookies.getAll("login_token")[0]?.value;

    const key = process.env.JOSE_SECRET;
    const secret = new TextEncoder().encode(key);
    try{
    const user = await jose.jwtVerify(login_token, secret);
    console.log(user)
    return user.payload;

    }catch(error){
        console.error("Token verification error:", error);
        return null; 
    }
}