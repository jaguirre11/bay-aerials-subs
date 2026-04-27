export default async function handler(req, res) {
  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message, hint: error.hint, details: error.details });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ caught: err.message, stack: err.stack });
  }
}
