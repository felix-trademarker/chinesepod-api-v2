const axios = require('axios');
let Model = require('../repositories/_model158')
var apilog = new Model('apilogv2')

exports.fn = async function(req, res, next) {
    console.log("API FORWARDER", req.url)
  url = `https://ws.chinesepod.com:444${req.url.replace('api/v2/','')}`;

  try {
    // The URL of the server you're relaying to
    console.log("API FORWARDER",url, req.method)
    // Forward the request body, headers, etc.
    let response = await axios.post(url, req.body, {
      headers: {
        ...req.headers
      }
    });

    switch(req.method) {
      case 'GET': 
        response = await axios.get(url, req.body, {
          headers: {
            ...req.headers
          }
        });
      break;
      case 'POST':
        response = await axios.post(url, req.body, {
          headers: {
            ...req.headers
          }
        });
      break;
      case 'PUT':
        response = await axios.put(url, req.body, {
          headers: {
            ...req.headers
          }
        });
      break;
      case 'DELETE':
        response = await axios.delete(url, req.body, {
          headers: {
            ...req.headers
          }
        });
      break;
    }


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
