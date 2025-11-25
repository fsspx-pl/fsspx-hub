import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id: tenantId } = await params;

    try {
      const payload = await getPayload({
        config: configPromise,
      });

      // Get confirmed subscribers from Payload (source of truth)
      const subscriptions = await payload.find({
        collection: 'newsletterSubscriptions',
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { status: { equals: 'confirmed' } },
          ],
        },
        limit: 0, // We only need the count
      });

      // Get tenant info for the name
      let tenantName = tenantId;
      try {
        const tenant = await payload.findByID({
          collection: 'tenants',
          id: tenantId,
        });
        tenantName = tenant.name || tenantId;
      } catch {
        // If tenant not found, use the ID
      }
      
      return NextResponse.json({
        name: tenantName,
        subscribersCount: subscriptions.totalDocs,
      });
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriber count' },
        { status: 500 }
      );
    }
  }