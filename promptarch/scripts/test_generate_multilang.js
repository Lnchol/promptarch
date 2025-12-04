import { createRequire } from "module";
const require = createRequire(import.meta.url);
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Use built-in fetch (Node 18+)

// Use built-in fetch if available (Node 18+)
const apiCall = async (lang) => {
  console.log(`Testing language: ${lang}`);
  try {
    const response = await fetch('http://127.0.0.1:3001/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Generate a simple button component description.",
        schema: { type: "OBJECT", properties: { description: { type: "STRING" } } },
        language: lang
      })
    });
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log(`Response for ${lang}:`, data);
  } catch (error) {
    console.error(`Failed for ${lang}:`, error.message);
  }
};

(async () => {
    // Wait for server to be ready if needed, or just run
    await apiCall('tr');
    await apiCall('en');
})();
