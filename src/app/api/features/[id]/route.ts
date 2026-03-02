import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const featureUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const feature = await db.feature.findUnique({ where: { id: params.id } });
    if (!feature) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: feature });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch feature' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = featureUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const feature = await db.feature.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        iconUrl: parsed.data.iconUrl === '' ? null : parsed.data.iconUrl,
        order: parsed.data.order
      }
    });

    return NextResponse.json({ success: true, data: feature });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update feature' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await db.feature.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete feature' }, { status: 500 });
  }
}
