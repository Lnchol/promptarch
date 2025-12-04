import https from 'https';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Querying: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("Available Models:");
        json.models.forEach(m => console.log(`- ${m.name}`));
      } else {
        console.log("No models found or error:", json);
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      console.log("Raw data:", data);
    }
  });
}).on('error', (e) => {
  console.error("Request error:", e);
});
