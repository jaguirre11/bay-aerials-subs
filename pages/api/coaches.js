import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {

  // GET — fetch all coaches
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('coaches')
      .select('*')
      .order('name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST — add a new coach
  if (req.method === 'POST') {
    const { name, phone, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Auto-generate a unique code
    const prefix = name.split(', ')[1]?.slice(0, 3).toUpperCase() || name.slice(0, 3).toUpperCase();
    const rand = Math.floor(Math.random() * 900) + 100;
    const code = `${prefix}${rand}`;

    const { data, error } = await supabaseAdmin
      .from('coaches')
      .insert([{ name, phone, email, code, active: true }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  // PATCH — update a coach (edit or deactivate)
  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const { data, error } = await supabaseAdmin
      .from('coaches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // DELETE — permanently remove a coach
  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabaseAdmin
      .from('coaches')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
