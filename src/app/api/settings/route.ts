import { NextResponse } from "next/server";
import { getRestaurantSettings } from "@/services/settings.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET() {
  try {
    const settings = await getRestaurantSettings();
    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleApiError(error);
  }
}
