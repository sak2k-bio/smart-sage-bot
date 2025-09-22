import { GoogleGenerativeAI } from "@google/generative-ai"
import axios from 'axios'
import { getVectorStore } from './vectorstore'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7')
const GEMINI_MAX_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS || '2048')

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null

export class BaseAgent { constructor(public name: string) {} async process(_input: any): Promise<any> { throw new Error('not implemented') } }

export class QueryAgent extends BaseAgent { constructor(){super('QueryAgent')} async process(input: any){ const steps:any=[]; const processedQuery = String(input.query||'').trim(); const needsRetrieval = this.shouldRetrieve(processedQuery); steps.push({agent:this.name,step:'Query Analysis',status:'completed',message:`Query processed. Needs retrieval: ${needsRetrieval}`,details:{originalQuery:input.query,processedQuery,needsRetrieval}}); return { processedQuery, needsRetrieval, thinkingSteps: steps } } shouldRetrieve(q:string){ const words=['what','how','why','when','where','who','which']; const l=q.toLowerCase(); return words.some(w=>l.includes(w)) || q.length>20 || l.includes('?') } }

export class RetrievalAgent extends BaseAgent { 
  constructor(){super('RetrievalAgent')} 
  async process(input:any){ 
    const steps:any=[]; 
    steps.push({agent:this.name,step:'Vector Search',status:'processing',message:'Searching for relevant documents...'}); 
    try {
      const store:any = await getVectorStore(); 
      console.log(`[RetrievalAgent] Searching for query: "${input.query}" with k=${input.k||5}`);
      const documents = await store.similaritySearch(input.query, input.k||5); 
      console.log(`[RetrievalAgent] Search returned ${documents.length} documents`);
      if (documents.length === 0) {
        console.log('[RetrievalAgent] NO SOURCES - No documents found in collection');
      } else {
        console.log('[RetrievalAgent] Documents found:', documents.map((d:any) => ({ 
          contentPreview: d.content?.substring(0, 100) + '...', 
          source: d.metadata?.source 
        })));
      }
      steps.push({agent:this.name,step:'Vector Search',status:'completed',message:`Found ${documents.length} relevant documents`}); 
      return { documents, thinkingSteps: steps };
    } catch (error: any) {
      console.error('[RetrievalAgent] Error during search:', error);
      steps.push({agent:this.name,step:'Vector Search',status:'error',message:`Search failed: ${error.message}`});
      return { documents: [], thinkingSteps: steps };
    }
  } 
}

export class AnswerAgent extends BaseAgent { constructor(){super('AnswerAgent')} async process(input:any){ const steps:any=[]; steps.push({agent:this.name,step:'Response Generation',status:'processing',message:'Generating response using retrieved context...'}); const context = (input.documents||[]).map((d:any)=>d.content).join('\n\n'); const answer = await this.generateAnswer(input.query, context); steps.push({agent:this.name,step:'Response Generation',status:'completed',message:'Response generated successfully'}); return { answer, thinkingSteps: steps } } async generateAnswer(query:string, context:string){ const prompt = `Based on the following context, please answer the question. If the context doesn't contain enough information to answer the question, please say so.

Context:
${context}

Question: ${query}

Answer:`; if(genAI){ try{ const model=genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig:{ temperature: GEMINI_TEMPERATURE, maxOutputTokens: GEMINI_MAX_TOKENS } }); const result=await model.generateContent(prompt); const response=await result.response; return response.text(); }catch(e){ console.warn('Google Gemini failed:', e)} } try{ const response = await axios.post(`${OLLAMA_HOST}/api/generate`, { model:'gemma3:1b', prompt, stream:false }); return response.data.response }catch(e){ console.error('Ollama failed:', e) } return "I apologize, but I'm unable to generate a response at the moment. Please try again later." } }

export class CriticAgent extends BaseAgent { constructor(){super('CriticAgent')} async process(input:any){ const steps:any=[]; const critiques:string[]=[]; let score=5; if((input.answer||'').length<50) critiques.push('Answer is too brief'); if((input.answer||'').includes("I don't know") || (input.answer||'').includes("I can't")) critiques.push('Answer indicates uncertainty'); if((input.documents||[]).length===0) critiques.push('No supporting documents found'); if((input.answer||'').length>100) score+=1; if((input.documents||[]).length>0) score+=2; if(!(input.answer||'').includes("I don't know")) score+=1; steps.push({agent:this.name,step:'Answer Evaluation',status:'completed',message:`Answer evaluated with score: ${score}/10`,details:{critique: critiques.length? critiques.join('; '): 'Answer appears comprehensive and well-supported',score}}); return { critique: critiques.length? critiques.join('; '): 'Answer appears comprehensive and well-supported', score, thinkingSteps: steps } } }

export class RefineAgent extends BaseAgent { constructor(){super('RefineAgent')} async process(input:any){ const steps:any=[]; const refinementPrompt=`Please refine the following answer based on the critique provided. Make it more comprehensive and accurate.

Original Query: ${input.query}
Original Answer: ${input.answer}
Critique: ${input.critique}
Supporting Documents: ${(input.documents||[]).map((d:any)=>d.content).join('\n\n')}

Refined Answer:`; let refined = input.answer; if(genAI){ try{ const model=genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig:{ temperature: GEMINI_TEMPERATURE, maxOutputTokens: GEMINI_MAX_TOKENS } }); const result=await model.generateContent(refinementPrompt); const response=await result.response; refined = response.text(); }catch(e){ console.warn('Google Gemini failed for refinement:', e) } } else { try{ const response = await axios.post(`${OLLAMA_HOST}/api/generate`, { model:'gemma3:1b', prompt: refinementPrompt, stream:false }); refined = response.data.response }catch(e){ console.error('Ollama failed for refinement:', e) } } steps.push({agent:this.name,step:'Answer Refinement',status:'completed',message:'Answer refined successfully'}); return { refinedAnswer: refined, thinkingSteps: steps } } }

export class QuizAgent extends BaseAgent { 
  constructor(){super('QuizAgent')} 
  async process(input:any){ 
    const steps:any=[]; 
    const docs = input.documents || [];
    
    // Split documents into chunks for different questions
    const chunksPerQuestion = Math.ceil(docs.length / (input.questionCount || 5));
    const documentChunks: any[][] = [];
    
    for (let i = 0; i < (input.questionCount || 5); i++) {
      const start = i * chunksPerQuestion;
      const end = Math.min(start + chunksPerQuestion, docs.length);
      if (start < docs.length) {
        documentChunks.push(docs.slice(start, end));
      }
    }
    
    console.log(`[QuizAgent] Creating ${input.questionCount||5} questions from ${docs.length} documents (${chunksPerQuestion} docs per question)`);
    
    // Join all context but emphasize variety
    const context = docs.map((d:any, idx:number) => `[Document ${idx+1}]\n${d.content}`).join('\n\n'); 
    
    const prompt=`Based on the following context about "${input.topic}", generate exactly ${input.questionCount||5} DIVERSE multiple choice questions with difficulty level: ${input.difficulty||'medium'}.

IMPORTANT: Each question MUST focus on DIFFERENT aspects or concepts from the context. Use information from different documents. DO NOT repeat similar questions or test the same concept multiple times.

For each question, provide:
1. A clear, unique question testing a different concept
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (0, 1, 2, or 3 for A, B, C, or D)
4. A brief explanation of why the answer is correct
5. Vary question types: factual, conceptual, application-based, etc.

Format as JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Explanation here",
    "difficulty": "${input.difficulty||'medium'}",
    "category": "${input.topic}"
  }
]

Context:
${context}

Generate ${input.questionCount||5} UNIQUE questions. JSON Response:`; 
    
    if(genAI){ 
      try{ 
        const model=genAI.getGenerativeModel({ 
          model: GEMINI_MODEL, 
          generationConfig:{ 
            temperature: 0.8, // Higher temperature for more variety
            maxOutputTokens: GEMINI_MAX_TOKENS 
          } 
        }); 
        const result=await model.generateContent(prompt); 
        const text=(await result.response).text(); 
        const m=text.match(/\[[\s\S]*\]/); 
        if(m){ 
          const questions=JSON.parse(m[0]).map((q:any,idx:number)=>({ 
            id:`quiz_${Date.now()}_${idx}_${Math.random().toString(36).substr(2,9)}`, 
            ...q, 
            source: docs[idx % docs.length]?.metadata?.source || 'Generated from context' 
          })); 
          steps.push({agent:this.name,step:'Quiz Generation',status:'completed',message:`Generated ${questions.length} diverse quiz questions`}); 
          return { questions: questions.slice(0, input.questionCount || 5), thinkingSteps: steps } 
        } 
      }catch(e){ 
        console.warn('Quiz generation with Gemini failed:', e) 
      } 
    } // fallback
 const fallback = Array.from({length: input.questionCount||3}).map((_,i)=>({ id:`fallback_${Date.now()}_${i}`, question:`What is an important concept related to ${input.topic}?`, options:["This is a concept from the provided context","This is not relevant to the topic","This is incorrect information","This is not mentioned in the context"], correctAnswer:0, explanation:`Based on the provided context about ${input.topic}, the first option represents concepts discussed in the source material.`, difficulty: input.difficulty||'medium', category: input.topic, source: input.documents?.[0]?.metadata?.source || 'Generated content' })); steps.push({agent:this.name,step:'Quiz Generation',status:'completed',message:`Generated ${fallback.length} fallback quiz questions`}); return { questions: fallback, thinkingSteps: steps } } }

export class SuggestionsAgent extends BaseAgent {
  constructor(){super('SuggestionsAgent')}
  async process(input:any){
    const steps:any=[];
    const topic = input.topic || input.query;
    const context = (input.documents||[]).map((d:any)=>d.content).join('\n');
    steps.push({agent:this.name,step:'Suggestions Generation',status:'processing',message:`Generating creative suggestions for: ${topic}`});
    
    const prompt = `Based on the topic "${topic}" and the following context, generate creative and practical suggestions organized into 3 categories:

1. Creative Applications - innovative ways to apply this knowledge
2. Learning & Education - educational applications and learning approaches  
3. Business Solutions - practical business or professional applications

For each category, provide exactly 3 specific, actionable suggestions that are relevant to the topic.

${context ? `Context:\n${context}\n\n` : ''}

Return as a JSON object with this structure:
{
  "creativeApplications": ["suggestion1", "suggestion2", "suggestion3"],
  "learningEducation": ["suggestion1", "suggestion2", "suggestion3"],
  "businessSolutions": ["suggestion1", "suggestion2", "suggestion3"],
  "proTip": "A helpful tip about combining or applying these suggestions"
}

Only output valid JSON, nothing else.`;

    try {
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig: { temperature: 0.8, maxOutputTokens: GEMINI_MAX_TOKENS } });
        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const suggestions = JSON.parse(match[0]);
          steps.push({agent:this.name,step:'Suggestions Generation',status:'completed',message:`Generated suggestions for all categories`});
          return { suggestions, thinkingSteps: steps };
        }
      }
    } catch (e) {
      console.warn('Suggestions generation failed:', e);
    }
    
    // Fallback suggestions
    const fallbackSuggestions = {
      creativeApplications: [
        `Build an interactive ${topic} visualization tool`,
        `Create a ${topic}-based creative writing assistant`,
        `Develop a gamified ${topic} learning experience`
      ],
      learningEducation: [
        `Design a ${topic} study guide with practice questions`,
        `Create flashcards for key ${topic} concepts`,
        `Build a ${topic} tutorial series for beginners`
      ],
      businessSolutions: [
        `Develop a ${topic} analysis tool for professionals`,
        `Create a ${topic} consulting framework`,
        `Build a ${topic} knowledge base for teams`
      ],
      proTip: `Combine elements from different categories to create unique solutions tailored to specific needs.`
    };
    
    steps.push({agent:this.name,step:'Suggestions Generation',status:'completed',message:`Generated fallback suggestions`});
    return { suggestions: fallbackSuggestions, thinkingSteps: steps };
  }
}

export class TutorAgent extends BaseAgent { constructor(){super('TutorAgent')} async process(input:any){ const steps:any=[]; const docs=(input.documents||[]);
  steps.push({agent:this.name,step:'Tutor Planning',status:'processing',message:`Creating a structured tutorial for: ${input.topic}`});
  const context = docs.map((d:any)=>`- ${d.content}`).join('\n');
  const jsonSpec = `Return JSON array with objects: { id: string, title: string, content: string, type: 'explanation' | 'example' | 'exercise' | 'summary' }`;
  const prompt = `You are a patient, expert tutor. Create a short tutorial about "${input.topic}" using ONLY the information from the context below. DO NOT use any external knowledge - base everything strictly on the provided documents. If the context doesn't contain enough information, acknowledge this limitation. The tutorial should include 3-5 sections (mix of explanation, example, exercise, and a brief summary). Keep content concise but meaningful.

Context from retrieved documents:\n${context}\n\n${jsonSpec}\nOnly output valid JSON array, nothing else.`;
  try {
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig: { temperature: 0.6, maxOutputTokens: GEMINI_MAX_TOKENS } });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const sections = JSON.parse(match[0]);
        steps.push({agent:this.name,step:'Tutor Generation',status:'completed',message:`Generated ${sections.length} tutorial sections via LLM`});
        return { tutorialSections: sections, thinkingSteps: steps };
      }
    } else {
      // Try Ollama as fallback
      try {
        const response = await axios.post(`${OLLAMA_HOST}/api/generate`, { model:'gemma3:1b', prompt:`${prompt}\n`, stream:false });
        const text = response.data.response as string;
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const sections = JSON.parse(match[0]);
          steps.push({agent:this.name,step:'Tutor Generation',status:'completed',message:`Generated ${sections.length} tutorial sections via Ollama`});
          return { tutorialSections: sections, thinkingSteps: steps };
        }
      } catch (e) { /* fall through to static fallback */ }
    }
  } catch (e) {
    console.warn('Tutor generation failed, using fallback:', e);
  }
  // Static fallback
  const sections = [ { id: 'intro', title: `Overview of ${input.topic}`, content: `This section introduces ${input.topic} with key ideas based on retrieved sources.`, type: 'explanation', sources: docs }, { id: 'example', title: 'Worked example', content: 'A small example illustrating the concept.', type: 'example', sources: docs.slice(0,1) }, { id: 'practice', title: 'Practice exercise', content: 'Try to summarize the concept in your own words.', type: 'exercise', sources: [] }, { id:'summary', title:'Summary', content:`Key takeaways about ${input.topic}.`, type:'summary', sources: [] } ] as any[]; steps.push({agent:this.name,step:'Tutor Generation',status:'completed',message:`Generated ${sections.length} fallback tutorial sections`}); return { tutorialSections: sections, thinkingSteps: steps } } }
