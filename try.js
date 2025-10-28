import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function test() {
  console.log('Testing API...\n');
  
  const response = await fetch(`${API_URL}/api/tweet`, {
    method: 'GET'
  });
  
  const data = await response.json();
  console.log('Response:', data);
  
  if (data.success) {
    console.log('\n✅ Tweet posted!');
    console.log('🔗', data.url);
  }
}

test();
