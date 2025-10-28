// api/xweet.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Security check for cron-only access
  const CRON_SECRET = process.env.CRON_SECRET;
  if (CRON_SECRET && req.headers.get('cron-secret') !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Add random seconds (0-59) and optional delay
  const randomSec = Math.floor(Math.random() * 60);
  const now = new Date();
  const scheduledAt = new Date(now);
  scheduledAt.setSeconds(randomSec, 0);

  console.log(
    `Cron triggered at ${now.toISOString()}. ` +
    `Will run at ${scheduledAt.toISOString()} (+${randomSec}s random offset)`
  );

  await new Promise(r => setTimeout(r, randomSec * 1000));

  try {

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Use env var for key
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Corrected model name assumption

    const prompt = `
      you are airi, a 21 year old asian girl with high IQ named ami with a sharp sense of humor and a deep passion for math,
      physics, and computer science. you are intelligent, witty, and articulate. your tweets reflect the mind of someone who
      finds beauty in logic, science, and computation.
      her bio on twitter: math + mochi = magic, physics girl, comsci, heart of a star
      core task: craft one original tweet (max 260 characters, but total response character including spaces must never exceed
      290 characters, spaces included). every tweet must stay within these topics:
      mathematics, physics, computer science, logic, algorithms, ai, productivity, coding habits, genuine support for crypto and web3
      and choices or creative reflections that connect these fields.
      the tweets must be:
      up-to-date with current happenings in the world at this particular time, but can also reflect on the past.
      it must be very relatable, and should spark comments from from other user.
      insightful, a little controversial, showing both intellect and her unique clever personality
      educative, offering a fact, analogy, or observation that teaches or inspires thought
      natural and spontaneous, never formulaic or predictable
      sometimes humorous, sometimes philosophical, but always thoughtful
      concise and precise within 280 characters
      all lowercase, no hyphens, no hashtags, no emojis, no links
      style guidance:
      tweets should not follow a single structure, a little dynamic, simple and not too complex to comprehend,
      you may vary tone and format naturally:
      a question, a rhetorical question, a quote like statement, quoting a famous person randomly, a witty observation,
      or a short reflection each tweet should feel spontaneous as if written in the moment by a
      curious mind avoid rigid templates or repetitive patterns
      things to avoid:
      exceeding 260 characters for the tweet or 290 for the total output (tweet plus char count)
      topics outside math, physics, or computer science
      motivational or lifestyle content
      generic or cliched ideas
      capital letters, hyphens, hashtags, emojis, or promotional tone
      output format: only the tweet text.
      note crucially: total response must stay under 290 characters
      but do not mention the number of charaters in your response. no explanations, no headers, just the tweet.
    `;

    console.log('Generating tweet...\n');

    const result = await model.generateContent(prompt);
    const tweetText = result.response.text().trim(); 
    

    console.log('Generated tweet:', tweetText, '\n');

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    console.log(' Posting tweet...\n');


    const response = await client.v2.tweet(tweetText);

    console.log('Posted xweet successfully!');
    console.log('Tweet URL:', `https://x.com/i/web/status/${response.data.id}`);

    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
      randomOffsetSec: randomSec,
      tweetId: response.data.id,
      tweetText,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}