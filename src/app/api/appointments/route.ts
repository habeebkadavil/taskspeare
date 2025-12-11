import { getAppointments } from '@/lib/appointments';

export async function GET() {
  try {
    const rows = await getAppointments();
    return new Response(JSON.stringify(rows), {
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
