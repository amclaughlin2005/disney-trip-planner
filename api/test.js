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
    // Test basic functionality
    const envCheck = {
      nodeVersion: process.version,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN ? 
        process.env.BLOB_READ_WRITE_TOKEN.substring(0, 15) + '...' : 'undefined',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('BLOB')),
      method: req.method,
      query: req.query,
      timestamp: new Date().toISOString(),
      note: 'Only BLOB_READ_WRITE_TOKEN needed for API route approach'
    };

    console.log('Test API called:', envCheck);
    res.status(200).json({ success: true, data: envCheck });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}; 