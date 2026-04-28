import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    // GET — list all coaches
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('name', { ascending: true });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    // POST — create a new coach
    if (req.method === 'POST') {
      const { name, phone, email } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });

      // Generate a 5-character code: first 3 letters of last name (or first name) + 2 digits
      const parts = name.split(',').map(s => s.trim());
      const lastName = parts[0] || name;
      const prefix = lastName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
      const suffix = String(Math.floor(Math.random() * 90) + 10);
      const code = `${prefix}${suffix}`;

      const { data, error } = await supabase
        .from('coaches')
        .insert([{ name, phone: phone || '', email: email || '', code, active: true }])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    // PATCH — update an existing coach
    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });

      // Only allow specific fields to be updated
      const allowed = {};
      if ('name' in updates) allowed.name = updates.name;
      if ('phone' in updates) allowed.phone = updates.phone;
      if ('email' in updates) allowed.email = updates.email;
      if ('active' in updates) allowed.active = updates.active;
      if ('code' in updates) allowed.code = updates.code;

      if (Object.keys(allowed).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const { data, error } = await supabase
        .from('coaches')
        .update(allowed)
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    // DELETE — remove a coach
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });

      const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
