const axios = require('axios');

exports.fn = async function(req, res, next) {
    
  url = `https://ws.chinesepod.com:444${req.url.replace('api/v2/','')}`;

  try {
    // The URL of the server you're relaying to
    console.log(url)
    // Forward the request body, headers, etc.
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        // Forward original headers if needed (e.g. authentication tokens)
        ...req.headers
      }
    });

    // Send back the response received from the other server
    res.status(response.status).json(response.data);
  } catch (error) {
    // Handle error from the other server
    console.error('Error relaying the request:', error.message);
    res.status(403).json({
      error: 'Forbidden'
    });
  }
  
} 
