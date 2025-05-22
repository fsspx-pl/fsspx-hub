import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id: newsletterGroupId } = await params;

    try {
      const response = await fetch(`${process.env.SENDER_API_URL}/groups/${newsletterGroupId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SENDER_APIKEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch newsletter group: ${response.statusText}`);
      }

      const { data } = await response.json();
      return NextResponse.json({
        title: data.title,
        subscribersCount: data.active_subscribers
      });
    } catch (error) {
      console.error('Error fetching newsletter group:', error);
      return NextResponse.json(
        { error: 'Failed to fetch newsletter group' },
        { status: 500 }
      );
    }
  }