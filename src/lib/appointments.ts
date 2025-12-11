import { query } from './db';

export type AppointmentRow = {
  id: string;
  customer: string;
  service: string;
  technician?: string | null;
  booking_type?: string | null;
  store_location?: string | null;
  preferred_date?: string | null;
  notes?: string | null;
  status?: string | null;
  created_by?: string | null;
  created_date?: string | null;
};

export type GetAppointmentsResult = {
  rows: AppointmentRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getAppointments(opts?: { page?: number; pageSize?: number; }): Promise<GetAppointmentsResult> {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, opts?.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  // total count
  const totalRes = await query<{ count: string }>('SELECT COUNT(*)::text as count FROM appointments');
  const total = parseInt(totalRes.rows[0]?.count ?? '0', 10);

  const res = await query<AppointmentRow>(
    'SELECT * FROM appointments ORDER BY preferred_date DESC NULLS LAST LIMIT $1 OFFSET $2',
    [pageSize, offset]
  );

  return { rows: res.rows, total, page, pageSize };
}

export async function getAppointmentById(id: string): Promise<AppointmentRow | null> {
  const res = await query<AppointmentRow>('SELECT * FROM appointments WHERE id = $1', [id]);
  return res.rows[0] ?? null;
}

export async function createAppointment(data: Omit<Partial<AppointmentRow>, 'id' | 'created_date'> & { customer: string; service: string; created_by?: string; preferred_date?: string; }) {
  const res = await query<AppointmentRow>(
    `INSERT INTO appointments (customer, service, technician, booking_type, store_location, preferred_date, notes, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      data.customer,
      data.service,
      data.technician || null,
      data.booking_type || null,
      data.store_location || null,
      data.preferred_date || null,
      data.notes || null,
      data.status || 'Scheduled',
      data.created_by || null,
    ]
  );
  return res.rows[0];
}

export async function updateAppointment(id: string, patch: Partial<AppointmentRow>) {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of Object.keys(patch)) {
    fields.push(`${key} = $${idx}`);
    // @ts-ignore
    values.push((patch as any)[key]);
    idx++;
  }
  if (fields.length === 0) return null;
  values.push(id);
  const q = `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const res = await query<AppointmentRow>(q, values);
  return res.rows[0] ?? null;
}

export async function deleteAppointment(id: string) {
  await query('DELETE FROM appointments WHERE id = $1', [id]);
  return true;
}
