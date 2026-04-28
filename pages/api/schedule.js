import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  // GET — load the full schedule
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('schedule')
      .select('name, day, time, cls')
      .order('name', { ascending: true })
      .order('day', { ascending: true })
      .order('time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  // POST — replace the entire schedule (used by CSV import)
  if (req.method === 'POST') {
    const { schedule } = req.body;
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ error: 'Missing or empty schedule array' });
    }

    // Validate each entry
    for (const entry of schedule) {
      if (!entry.name || !entry.day || !entry.time || !entry.cls) {
        return res.status(400).json({ error: 'Each entry needs name, day, time, cls' });
      }
    }

    // Delete all existing schedule rows, then insert the new ones
    const { error: delError } = await supabaseAdmin
      .from('schedule')
      .delete()
      .neq('id', 0); // delete all rows (neq id 0 matches everything since ids are auto-increment starting at 1)

    if (delError) return res.status(500).json({ error: 'Failed to clear old schedule: ' + delError.message });

    // Insert in chunks of 500 to avoid payload limits
    const chunkSize = 500;
    for (let i = 0; i < schedule.length; i += chunkSize) {
      const chunk = schedule.slice(i, i + chunkSize).map(({ name, day, time, cls }) => ({
        name, day, time, cls
      }));
      const { error: insError } = await supabaseAdmin
        .from('schedule')
        .insert(chunk);
      if (insError) return res.status(500).json({ error: 'Failed to insert schedule: ' + insError.message });
    }

    return res.status(200).json({ success: true, count: schedule.length });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // CSV imports can be large
    },
  },
};
