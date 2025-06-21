module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // First, try to import the blob package
    let put, list, del;
    try {
      const blobModule = require('@vercel/blob');
      put = blobModule.put;
      list = blobModule.list;
      del = blobModule.del;
      console.log('Successfully imported @vercel/blob');
    } catch (importError) {
      console.error('Failed to import @vercel/blob:', importError);
      return res.status(500).json({ 
        error: 'Failed to import @vercel/blob package',
        details: importError.message 
      });
    }

    const { method, query } = req;
    const { action, deviceId, tripId } = query;

    // Debug logging
    console.log('API Route called:', { method, action, deviceId, tripId });
    console.log('Environment check:', {
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 15) + '...' : 'undefined'
    });

    switch (method) {
      case 'GET':
        if (action === 'list') {
          // Check if we have the blob token (server-side version)
          if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('BLOB_READ_WRITE_TOKEN not found in serverless function');
            return res.status(500).json({ error: 'Blob storage not configured - BLOB_READ_WRITE_TOKEN missing' });
          }

          const prefix = deviceId ? `trips/${deviceId}/` : 'trips/';
          console.log('Listing blobs with prefix:', prefix);
          
          const { blobs } = await list({ prefix });
          console.log('Found blobs:', blobs.length);
          
          // Convert blobs to trip data
          const trips = [];
          for (const blob of blobs) {
            try {
              console.log('Fetching blob:', blob.pathname);
              const response = await fetch(blob.url);
              if (response.ok) {
                const tripData = await response.json();
                trips.push(tripData);
              } else {
                console.error('Failed to fetch blob:', blob.pathname, response.status);
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
          
          console.log('Returning trips:', trips.length);
          res.status(200).json({ trips });
        } else {
          res.status(400).json({ error: 'Invalid action' });
        }
        break;

      case 'POST':
        if (action === 'save') {
          console.log('Processing save request...');
          console.log('Request body type:', typeof req.body);
          console.log('Request body present:', !!req.body);
          
          // Parse request body
          let bodyText = '';
          let trip;
          
          try {
            if (req.body) {
              bodyText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
              console.log('Body from req.body, length:', bodyText.length);
            } else {
              // Read from stream if body is not parsed
              console.log('Reading body from stream...');
              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              bodyText = Buffer.concat(chunks).toString();
              console.log('Body from stream, length:', bodyText.length);
            }
            
            console.log('Parsing JSON...');
            trip = JSON.parse(bodyText);
            console.log('Trip parsed successfully, ID:', trip.id, 'Name:', trip.name);
            
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Body text preview:', bodyText.substring(0, 200));
            return res.status(400).json({ 
              error: 'Invalid JSON in request body',
              details: parseError.message 
            });
          }
          
          try {
            const tripData = {
              ...trip,
              deviceId,
              updatedAt: new Date().toISOString(),
              createdAt: trip.createdAt || new Date().toISOString()
            };
            
            const blobName = `trips/${deviceId}/${trip.id}.json`;
            console.log('Saving to blob:', blobName);
            
            const blob = await put(blobName, JSON.stringify(tripData), {
              access: 'public'
            });
            
            console.log('Save successful:', blob.url);
            res.status(200).json({ success: true, url: blob.url });
            
          } catch (saveError) {
            console.error('Blob save error:', saveError);
            return res.status(500).json({ 
              error: 'Failed to save to blob storage',
              details: saveError.message 
            });
          }
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
    });
  }
} 