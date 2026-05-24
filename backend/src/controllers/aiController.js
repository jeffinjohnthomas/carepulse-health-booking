const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const triageSymptom = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `You are an AI medical triage assistant. Analyze the following symptoms: "${symptoms}". 
    Provide a very brief analysis of possible causes and recommend the type of specialist the user should see from this list: Cardiology, Neurology, Pediatrics, Orthopedics, General Medicine, Gynecology, Dermatology, Psychiatry, Urology, Gastroenterology, Nephrology, Dentistry, Ophthalmology, ENT.
    Also, indicate the urgency level (Low, Medium, High).
    Format your response as JSON with the following structure:
    {
      "analysis": "Brief explanation",
      "recommendedSpecialist": "Specialist Name",
      "urgency": "Low/Medium/High"
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up Markdown JSON wrapper if returned
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedResult = JSON.parse(cleanedText);
    res.json(parsedResult);
  } catch (error) {
    console.error('AI Triage Error:', error);
    res.status(500).json({ message: 'Failed to process AI triage' });
  }
};

const parseMedicalRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    
    // Validate mime type
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];
    if (!supportedTypes.includes(mimeType)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Unsupported file format. Please upload a PDF, Image, or Text file.' });
    }
    
    // Read file as base64
    const fileData = fs.readFileSync(filePath).toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `You are a medical data extraction assistant. I have uploaded a medical record (such as a blood test report or prescription).
    Please analyze this document and extract key metrics like Heart Rate, Blood Sugar, Cholesterol, Blood Pressure, or any prescribed medications.
    Format your response in a clean, human-readable summary that the patient can understand. Do not invent data that is not in the document.
    If it's not a medical document, say so.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: fileData, mimeType } }
    ]);
    
    const response = result.response;

    // Clean up temp file
    fs.unlinkSync(filePath);

    res.json({ analysis: response.text() });
  } catch (error) {
    console.error('AI Parse Error:', error);
    res.status(500).json({ message: 'Failed to parse medical record' });
  }
};

module.exports = { triageSymptom, parseMedicalRecord };
