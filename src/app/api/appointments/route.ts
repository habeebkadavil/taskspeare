import { getAppointments } from '@/lib/appointments';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize') || url.searchParams.get('limit');

    const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
    const pageSize = pageSizeParam ? Math.max(1, Math.min(100, parseInt(pageSizeParam, 10) || 20)) : 20;

    const result = await getAppointments({ page, pageSize });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/appointments error', err);
    return new Response(JSON.stringify({ error: 'Failed to load appointments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
