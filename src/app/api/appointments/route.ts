import { getAppointments, createAppointment } from '@/lib/appointments';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.customer || typeof body.customer !== 'string') {
      return new Response(JSON.stringify({ error: 'customer is required (string)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!body.service || typeof body.service !== 'string') {
      return new Response(JSON.stringify({ error: 'service is required (string)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Optional fields with defaults
    const appointment = await createAppointment({
      customer: body.customer,
      service: body.service,
      technician: body.technician || null,
      booking_type: body.booking_type || null,
      store_location: body.store_location || null,
      preferred_date: body.preferred_date || null,
      notes: body.notes || null,
      status: body.status || 'Scheduled',
      created_by: body.created_by || 'api',
    });

    return new Response(JSON.stringify({ ok: true, appointment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/appointments error', err);
    return new Response(JSON.stringify({ error: 'Failed to create appointment', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
