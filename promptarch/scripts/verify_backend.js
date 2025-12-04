import http from 'http';

const postData = JSON.stringify({
  prompt: "Test prompt",
  schema: { type: "OBJECT", properties: { role: { type: "STRING" } } }
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log("Verifying backend...");

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
