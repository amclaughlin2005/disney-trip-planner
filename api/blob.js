import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query, body } = req;
    const { action, deviceId, tripId } = query;

    switch (method) {
      case 'GET':
        if (action === 'list') {
          const prefix = deviceId ? `trips/${deviceId}/` : 'trips/';
          const { blobs } = await list({ prefix });
          
          // Convert blobs to trip data
          const trips = [];
          for (const blob of blobs) {
            try {
              const response = await fetch(blob.url);
              if (response.ok) {
                const tripData = await response.json();
                trips.push(tripData);
              }
            } catch (error) {
              console.error('Error fetching trip blob:', blob.pathname, error);
            }
          }
          
          // Sort by updatedAt descending
          trips.sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return bTime - aTime;
          });
          
          res.status(200).json({ trips });
        } else {
          res.status(400).json({ error: 'Invalid action' });
        }
        break;

      case 'POST':
        if (action === 'save') {
          const trip = JSON.parse(body);
          const tripData = {
            ...trip,
            deviceId,
            updatedAt: new Date().toISOString(),
            createdAt: trip.createdAt || new Date().toISOString()
          };
          
          const blobName = `trips/${deviceId}/${trip.id}.json`;
          const blob = await put(blobName, JSON.stringify(tripData), {
            access: 'public'
          });
          
          res.status(200).json({ success: true, url: blob.url });
        } else {
          res.status(400).json({ error: 'Invalid action' });
        }
        break;

      case 'DELETE':
        if (action === 'delete' && tripId) {
          const blobName = `trips/${deviceId}/${tripId}.json`;
          await del(blobName);
          res.status(200).json({ success: true });
        } else {
          res.status(400).json({ error: 'Invalid action or missing tripId' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Blob API error:', error);
    res.status(500).json({ error: error.message });
  }
} 