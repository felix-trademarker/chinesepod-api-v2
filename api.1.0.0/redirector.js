const axios = require('axios');
let Model = require('../repositories/_model158')
var apilog = new Model('apilogv2')

exports.fn = async function(req, res, next) {
    
  url = `https://ws.chinesepod.com:444${req.url.replace('api/v2/','')}`;

  try {
    // The URL of the server you're relaying to
    console.log(url, req.method)
    // Forward the request body, headers, etc.
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        // Forward original headers if needed (e.g. authentication tokens)
        ...req.headers
      }
    });

    apilog.put({
      timestamp: new Date (),
      req: req.url.replace('api/v2/',''),
      res: response.data,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      method: req.method,
      status: response.status
    })

    // Send back the response received from the other server
    res.status(response.status).json(response.data);
  } catch (error) {
    // Handle error from the other server
    console.error('Error relaying the request:', error.message);

    apilog.put({
      timestamp: new Date (),
      req: req.url.replace('api/v2/',''),
      res: error.message,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      method: req.method,
      status: 403
    })

    res.status(403).json({
      error: 'Forbidden'
    });
  }
  
} 
