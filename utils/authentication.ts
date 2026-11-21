import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { promises } from "dns";
import { RequestUserType } from "@/types/requestUser";


export  async function getUser(req: NextRequest):Promise <RequestUserType | null> {
const login_token = req.cookies.getAll("login_token")[0]?.value;

    const key = process.env.JOSE_SECRET;
    const secret = new TextEncoder().encode(key);
    try{
    const tokenData = await jose.jwtVerify(login_token, secret);
    const user = tokenData.payload as unknown as RequestUserType;
    return user;

    }catch(error){
        console.error("Token verification error:", error);
        return null; 
    }
}

export async function checkPrivileges(req: NextRequest,Privileges: string[]) : Promise<boolean> {

    const reqUser: RequestUserType | null = await getUser(req);
    if (reqUser==null) {
        return false;
    }
   if (reqUser.privileges.includes(Privileges[0])) {
    return true;

   }
   else{
    return false;
   }



}