import { NextRequest, NextResponse } from "next/server";
import { getGroup } from "@/utilities/mailerlite";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id: newsletterGroupId } = await params;

    try {
      const response = await getGroup(newsletterGroupId);
      
      return NextResponse.json({
        name: response.name,
        subscribersCount: response.subscribersCount
      });
    } catch (error) {
      console.error('Error fetching newsletter group count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch newsletter group count' },
        { status: 500 }
      );
    }
  }