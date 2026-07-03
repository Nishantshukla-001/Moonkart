import { NextResponse } from "next/server";

/**
 * Consistent JSON response envelope for every API route (docs/API.md).
 */
export function apiSuccess<T>(data: T, message = "Operation successful", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function apiError(message: string, errors: string[] = [], status = 400) {
  return NextResponse.json({ success: false, message, errors }, { status });
}
