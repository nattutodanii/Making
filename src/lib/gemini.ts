import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const generateProblemStatements = async (
  skills: string[],
  problemStatement: string,
  existingProblems: Array<{ problem_title: string; problem_description: string }> = []
) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please check your environment variables.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create context from existing problems
    const existingContext = existingProblems.length > 0 
      ? `\n\nPrevious problems created for this student:\n${existingProblems.map((p, i) => 
          `Problem ${i + 1}: ${p.problem_title}\nDescription: ${p.problem_description}`
        ).join('\n\n')}`
      : '';

    const prompt = `You are an expert hackathon mentor creating progressive learning challenges for Smart India Hackathon (SIH) preparation.

Student Profile:
- Skills (in order of confidence): ${skills.join(', ')}
- Target Problem Statement: ${problemStatement}${existingContext}

Create a single problem statement that:
1. Focuses on their STRONGEST skills (first 2-3 skills listed)
2. Gradually builds complexity if this is not their first problem
3. Relates to their chosen SIH domain
4. Is practical and implementable in 6-8 hours
5. Includes both coding and explanation components
6. Builds upon previous problems if any exist

${existingProblems.length === 0 ? 'This is their FIRST problem - start with fundamentals of their strongest skill.' : 
  `This is problem ${existingProblems.length + 1} - build upon previous concepts while introducing new challenges.`}

Return ONLY a JSON object with this exact structure:
{
  "problem_title": "Clear, engaging title (max 60 chars)",
  "problem_description": "Detailed description including: 1) What to build, 2) Key requirements, 3) Expected deliverables, 4) Evaluation criteria. Be specific about features and functionality. (200-400 words)"
}

Make it challenging but achievable, focusing on practical skills they'll need in SIH.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const problemData = JSON.parse(cleanedText);
    
    return problemData;
  } catch (error) {
    console.error('Error generating problem statement:', error);
    throw new Error('Failed to generate problem statement');
  }
};