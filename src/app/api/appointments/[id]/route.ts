import { getAppointmentById, updateAppointment, deleteAppointment } from '@/lib/appointments';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await getAppointmentById(params.id);
    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true, appointment }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/appointments/[id] error', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch appointment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Build partial update object (only update provided fields)
    const update: any = {};
    const allowedFields = ['customer', 'service', 'technician', 'booking_type', 'store_location', 'preferred_date', 'notes', 'status'];
    for (const field of allowedFields) {
      if (field in body) {
        update[field] = body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const appointment = await updateAppointment(params.id, update);
    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, appointment }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('PUT /api/appointments/[id] error', err);
    return new Response(JSON.stringify({ error: 'Failed to update appointment', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteAppointment(params.id);
    return new Response(JSON.stringify({ ok: true, message: 'Appointment deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('DELETE /api/appointments/[id] error', err);
    return new Response(JSON.stringify({ error: 'Failed to delete appointment', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
