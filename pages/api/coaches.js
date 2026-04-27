export default async function handler(req, res) {
  return res.status(200).json({
    supabase_url: process.env.SUPABASE_URL ? 'found' : 'MISSING',
    service_key: process.env.SUPABASE_SERVICE_KEY ? 'found' : 'MISSING',
  });
}
