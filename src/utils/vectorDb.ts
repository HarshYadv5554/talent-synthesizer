
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ResumeVector {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    name: string;
    email: string;
    skills: string[];
  };
}

// Function to generate embeddings using OpenAI's API
async function generateEmbedding(text: string): Promise<number[]> {
  const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!openAiKey) {
    throw new Error('Missing OpenAI API key. Please ensure VITE_OPENAI_API_KEY is set.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Store resume in vector database
export async function storeResumeVector(
  content: string,
  metadata: ResumeVector['metadata']
): Promise<void> {
  try {
    const embedding = await generateEmbedding(content);
    
    const { error } = await supabase
      .from('resume_vectors')
      .insert([
        {
          content,
          embedding,
          metadata
        }
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error storing resume vector:', error);
    throw error;
  }
}

// Search similar resumes
export async function searchSimilarResumes(
  queryText: string,
  limit: number = 5
): Promise<ResumeVector[]> {
  try {
    const queryEmbedding = await generateEmbedding(queryText);
    
    const { data, error } = await supabase
      .rpc('match_resumes', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching similar resumes:', error);
    throw error;
  }
}
