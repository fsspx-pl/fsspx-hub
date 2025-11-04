import { NextRequest, NextResponse } from "next/server";
import { getContactList } from "@/utilities/awsSes";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id: newsletterGroupId } = await params;
    const { searchParams } = new URL(request.url);
    const topicName = searchParams.get('topic');

    try {
      const response = await getContactList(newsletterGroupId, topicName || undefined);
      
      return NextResponse.json({
        name: response.name,
        subscribersCount: response.subscribersCount,
        topicName: response.topicName
      });
    } catch (error) {
      console.error('Error fetching contact list count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact list count' },
        { status: 500 }
      );
    }
  }