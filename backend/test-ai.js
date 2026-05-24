const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const response = await model.generateContent('Respond with hello');
    console.log(response.response.text());
  } catch (err) {
    console.error('Error:', err);
  }
};

test();
