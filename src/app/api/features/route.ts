import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const featureSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  iconUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().optional()
});

async function requireAdmin(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    if (!payload.sub || typeof payload.sub !== 'string') return null;
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || 50);
    const offset = Number(searchParams.get('offset') || 0);

    const features = await db.feature.findMany({
      skip: offset,
      take: limit,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });

    return NextResponse.json({ success: true, data: features });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch features' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = featureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const feature = await db.feature.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        iconUrl: parsed.data.iconUrl ? parsed.data.iconUrl : null,
        order: parsed.data.order ?? 0
      }
    });

    return NextResponse.json({ success: true, data: feature }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create feature' }, { status: 500 });
  }
}
