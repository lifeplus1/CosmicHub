export default function handler(req, res) {
    try {
        if (!process.env.API_KEY) {
            console.error('API_KEY environment variable not set');
            return res.status(500).json({ error: 'API key not configured' });
        }
        res.status(200).json({ apiKey: process.env.API_KEY });
    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}