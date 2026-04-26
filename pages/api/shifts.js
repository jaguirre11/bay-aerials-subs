import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { instructor_name, date, day, time, cls, notes } = req.body;
    if (!instructor_name || !date || !day || !time || !cls) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('shifts')
      .insert([{ instructor_name, date, day, time, cls, notes, status: 'open' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabaseAdmin.from('shifts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
