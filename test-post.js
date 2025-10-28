// For local testing - run with: npm run test-post
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

// Same setup as main function
const genAI = new GoogleGenerativeAI(process.env.AUTO_PROMPT);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function testPost() {
  try {
    console.log('🧪 Testing tweet generation & posting...\n');
    
   
    
    const result = await model.generateContent(process.env.AUTO_PROMPT);
    const tweetText = result.response.text();
    
    console.log('📝 Generated tweet:', tweetText, '\n');

    const response = await client.v2.tweet(tweetText);
    console.log('✅ Posted successfully!');
    console.log('🔗 Tweet URL:', `https://x.com/i/web/status/${response.data.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPost();