
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API with the correct model name
const genAI = new GoogleGenerativeAI('AIzaSyBAaQtGg36VqGPB5B2LLCtdEu0ml8IwrJg');
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); // Updated model name

export interface CandidateProfile {
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
  score: number;
  feedback: string;
}

export const analyzeResume = async (resumeText: string): Promise<CandidateProfile> => {
  try {
    const prompt = `
      Analyze this resume text and provide a structured response with:
      1. A brief professional summary
      2. Key skills (as a list)
      3. Notable experience highlights (as a list)
      4. Education details (as a list)
      5. A score from 0-100 based on overall profile strength
      6. Brief feedback on areas of improvement

      Resume text:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response text to extract structured information
    const sections = text.split('\n\n');
    
    return {
      summary: sections[0]?.replace('Summary:', '').trim() || '',
      skills: sections[1]?.replace('Skills:', '').split(',').map(s => s.trim()) || [],
      experience: sections[2]?.replace('Experience:', '').split('-').map(s => s.trim()).filter(Boolean) || [],
      education: sections[3]?.replace('Education:', '').split('-').map(s => s.trim()).filter(Boolean) || [],
      score: parseInt(sections[4]?.replace('Score:', '').trim() || '0'),
      feedback: sections[5]?.replace('Feedback:', '').trim() || ''
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

export const matchJobDescription = async (resumeText: string, jobDescription: string): Promise<{
  matchScore: number;
  feedback: string;
  missingSkills: string[];
}> => {
  try {
    const prompt = `
      Compare this resume with the job description and provide:
      1. A match score (0-100)
      2. Specific feedback on fit
      3. List of missing skills or qualifications

      Resume:
      ${resumeText}

      Job Description:
      ${jobDescription}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response
    const sections = text.split('\n\n');
    
    return {
      matchScore: parseInt(sections[0]?.replace('Match Score:', '').trim() || '0'),
      feedback: sections[1]?.replace('Feedback:', '').trim() || '',
      missingSkills: sections[2]?.replace('Missing Skills:', '').split(',').map(s => s.trim()) || []
    };
  } catch (error) {
    console.error('Error matching job description:', error);
    throw error;
  }
};
