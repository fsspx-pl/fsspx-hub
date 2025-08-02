import { NextRequest, NextResponse } from 'next/server';
import { fetchAnnouncementsByMonth } from '@/_api/fetchAnnouncements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const domain = searchParams.get('domain');

    if (!year || !month || !domain) {
      return NextResponse.json(
        { error: 'Missing required parameters: year, month, domain' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum)) {
      return NextResponse.json(
        { error: 'Invalid year or month parameters' },
        { status: 400 }
      );
    }

    const announcements = await fetchAnnouncementsByMonth(domain, yearNum, monthNum);

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error in announcements API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 