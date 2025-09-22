import { 
  QueryAgent, 
  RetrievalAgent, 
  AnswerAgent, 
  CriticAgent, 
  RefineAgent,
  QuizAgent,
  TutorAgent,
  SuggestionsAgent 
} from './agents'

export class BasePipeline { constructor(public name: string) {} async process(_query: string, _options?: any): Promise<any> { throw new Error('not implemented') } }

class Phase1Pipeline extends BasePipeline { constructor(){super('Phase 1: Basic A2A')} async process(query: string){
  const steps: any[]=[]
  const queryAgent=new QueryAgent(); const q=await queryAgent.process({query}); steps.push(...q.thinkingSteps)
  let documents: any[]=[]
  if(q.needsRetrieval){ const r=new RetrievalAgent(); const rr=await r.process({query:q.processedQuery,k:3}); steps.push(...rr.thinkingSteps); documents=rr.documents }
  const a=new AnswerAgent(); const ar=await a.process({query:q.processedQuery,documents}); steps.push(...ar.thinkingSteps)
  return { answer: ar.answer, thinkingSteps: steps, pipelineInfo: this.name, sources: documents }
}}

class Phase2Pipeline extends BasePipeline { constructor(){super('Phase 2: Smart A2A')} async process(query: string){
  const steps: any[]=[]
  const qAgent=new QueryAgent(); const q=await qAgent.process({query}); steps.push(...q.thinkingSteps)
  let documents: any[]=[]
  if(q.needsRetrieval){ const r=new RetrievalAgent(); const rr=await r.process({query:q.processedQuery,k:5}); steps.push(...rr.thinkingSteps); documents=rr.documents }
  const a=new AnswerAgent(); const ar=await a.process({query:q.processedQuery,documents}); steps.push(...ar.thinkingSteps); let answer=ar.answer
  const c=new CriticAgent(); const cr=await c.process({query:q.processedQuery,answer,documents}); steps.push(...cr.thinkingSteps)
  if(cr.score<7){ const ref=new RefineAgent(); const rf=await ref.process({query:q.processedQuery,answer,critique:cr.critique,documents}); steps.push(...rf.thinkingSteps); answer=rf.refinedAnswer }
  return { answer, thinkingSteps: steps, pipelineInfo: this.name, sources: documents }
}}

class Phase3Pipeline extends BasePipeline { constructor(){super('Phase 3: Self-Refinement')} async process(query: string){
  const steps: any[]=[]; const qA=new QueryAgent(); const q=await qA.process({query}); steps.push(...q.thinkingSteps)
  let documents: any[]=[]
  if(q.needsRetrieval){ const r=new RetrievalAgent(); const rr=await r.process({query:q.processedQuery,k:7}); steps.push(...rr.thinkingSteps); documents=rr.documents }
  const a=new AnswerAgent(); const ar=await a.process({query:q.processedQuery,documents}); steps.push(...ar.thinkingSteps); let current=ar.answer
  let iter=0; while(iter<3){ const c=new CriticAgent(); const cr=await c.process({query:q.processedQuery,answer:current,documents}); steps.push(...cr.thinkingSteps); if(cr.score>=8) break; const ref=new RefineAgent(); const rf=await ref.process({query:q.processedQuery,answer:current,critique:cr.critique,documents}); steps.push(...rf.thinkingSteps); current=rf.refinedAnswer; iter++ }
  return { answer: current, thinkingSteps: steps, pipelineInfo: this.name, sources: documents }
}}

class AutoPipeline extends BasePipeline { constructor(){super('AUTO: AI Selects Optimal')} async process(query: string){
  const steps:any=[]; const complexity=query.length<30? 'simple' : query.length>100? 'complex' : 'medium'
  let selected: BasePipeline = complexity==='simple'? new Phase1Pipeline() : complexity==='medium'? new Phase2Pipeline() : new Phase3Pipeline()
  const res=await selected.process(query); steps.push(...(res.thinkingSteps||[]))
  return { answer: res.answer, thinkingSteps: steps, pipelineInfo: `${this.name} → ${selected.name}`, sources: res.sources||[] }
}}

class QuizPipeline extends BasePipeline { 
  constructor(){super('Quiz Generation Pipeline')} 
  async process(query:string, options:any={}){ 
    const steps:any=[]; 
    const qa=new QueryAgent(); 
    const q=await qa.process({query}); 
    steps.push(...q.thinkingSteps); 
    const r=new RetrievalAgent(); 
    const rr=await r.process({query:q.processedQuery,k:options.documentCount||15}); // Get more docs for variety
    steps.push(...rr.thinkingSteps); 
    
    // Shuffle documents to ensure variety in questions
    const shuffledDocs = [...rr.documents].sort(() => Math.random() - 0.5);
    console.log(`[QuizPipeline] Retrieved ${rr.documents.length} documents, shuffling for variety`);
    
    const quiz=new QuizAgent(); 
    const qr=await quiz.process({ 
      topic: options.topic||q.processedQuery, 
      documents: shuffledDocs, 
      difficulty: options.difficulty||'medium', 
      questionCount: options.questionCount||5 
    }); 
    steps.push(...qr.thinkingSteps); 
    return { 
      questions: qr.questions, 
      thinkingSteps: steps, 
      pipelineInfo: this.name, 
      sources: rr.documents.slice(0, 5), // Show only first 5 sources 
      metadata: { 
        topic: options.topic||q.processedQuery, 
        difficulty: options.difficulty||'medium', 
        questionCount: qr.questions.length 
      } 
    } 
  }
}
class TutorPipeline extends BasePipeline { constructor(){super('Tutoring Pipeline')} async process(query:string, options:any={}){ const steps:any=[]; const qa=new QueryAgent(); const q=await qa.process({query}); steps.push(...q.thinkingSteps); const r=new RetrievalAgent(); const rr=await r.process({query:q.processedQuery,k:options.documentCount||8}); steps.push(...rr.thinkingSteps); const tutor=new TutorAgent(); const tr=await tutor.process({ topic: options.topic||q.processedQuery, documents: rr.documents, userLevel: options.userLevel||'intermediate', learningStyle: options.learningStyle||'reading' }); steps.push(...tr.thinkingSteps); return { tutorialSections: tr.tutorialSections, thinkingSteps: steps, pipelineInfo: this.name, sources: rr.documents, metadata: { topic: options.topic||q.processedQuery, userLevel: options.userLevel||'intermediate', sectionCount: tr.tutorialSections.length } } }}
class SuggestionsPipeline extends BasePipeline { constructor(){super('Suggestions Pipeline')} async process(query:string, options:any={}){ const steps:any=[]; const qa=new QueryAgent(); const q=await qa.process({query}); steps.push(...q.thinkingSteps); let documents:any[]=[]; if(q.needsRetrieval && options.useContext !== false){ const r=new RetrievalAgent(); const rr=await r.process({query:q.processedQuery,k:options.documentCount||5}); steps.push(...rr.thinkingSteps); documents=rr.documents; } const suggest=new SuggestionsAgent(); const sr=await suggest.process({ topic: options.topic||q.processedQuery, query: q.processedQuery, documents, creativity: options.creativity||'balanced' }); steps.push(...sr.thinkingSteps); return { suggestions: sr.suggestions, thinkingSteps: steps, pipelineInfo: this.name, sources: documents, metadata: { topic: options.topic||q.processedQuery, creativity: options.creativity||'balanced', hasContext: documents.length > 0 } } }}

export function createPipeline(mode: string): BasePipeline { switch(mode){ case 'phase1': return new Phase1Pipeline(); case 'phase2': return new Phase2Pipeline(); case 'phase3': return new Phase3Pipeline(); case 'auto': return new AutoPipeline(); case 'meta': return new AutoPipeline(); case 'quiz': return new QuizPipeline(); case 'tutor': return new TutorPipeline(); case 'suggestions': return new SuggestionsPipeline(); default: return new AutoPipeline(); } }
