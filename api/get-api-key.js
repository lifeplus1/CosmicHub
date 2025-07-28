export default function handler(req, res) {
    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    res.status(200).json({ apiKey: process.env.API_KEY });
}