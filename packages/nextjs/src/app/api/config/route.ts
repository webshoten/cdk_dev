import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    apiUrl: process.env.API_URL ?? "",
  });
}
