import { NextResponse } from 'next/server';
import { conectarBD } from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await conectarBD();
    return NextResponse.json({
      ok: true,
      estado: conn.connection.readyState,
      baseDeDatos: conn.connection.name,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}