import { NextRequest } from "next/server";

export default function pageCountSize(req:NextRequest){

     const pageNumberInString = req.nextUrl.searchParams.get("pageNumber") 
    const pageSizeInString = req.nextUrl.searchParams.get("pageSize")

    const pageNumber = pageNumberInString ? parseInt(pageNumberInString) : 1;
    const pageSize = pageSizeInString ? parseInt(pageSizeInString) : 10;

    return({
        pageNumber:pageNumber,
        pageSize:pageSize
    })

}