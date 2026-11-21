import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/utils/authentication";


export async function GET(req: NextRequest) {

  const user = await getUser(req);
    
  if (!user) {
    return NextResponse.json({
      message: "User not authenticated",
    }, { status: 401 });
  }
}