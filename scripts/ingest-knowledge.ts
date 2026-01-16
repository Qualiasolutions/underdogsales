#!/usr/bin/env npx tsx
/**
 * Knowledge Base Ingestion Script
 *
 * This script parses all Underdog methodology content and ingests it into
 * the knowledge_base table with OpenAI embeddings for RAG search.
 *
 * Usage: npx tsx scripts/ingest-knowledge.ts
 *
 * Content sources:
 * - docs/cold-calling-wiki/*.md (9 files)
 * - src/config/personas.ts (6 personas)
 * - src/config/rubric.ts (6 dimensions)
 * - src/config/curriculum.ts (12 modules)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as fs from 'fs/promises'

// Use OpenRouter for embeddings (compatible with OpenAI SDK)
const EMBEDDING_BASE_URL = 'https://openrouter.ai/api/v1'
const EMBEDDING_MODEL = 'openai/text-embedding-3-small'

// Types
interface KnowledgeChunk {
  source: 'wiki' | 'persona' | 'rubric' | 'curriculum'
  source_file: string
  section_title: string
  content: string
  topics: string[]
  metadata: Record<string, unknown>
}

// Configuration
const WIKI_DIR = path.join(__dirname, '../../docs/cold-calling-wiki')
const CONFIG_DIR = path.join(__dirname, '../src/config')

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Use OpenRouter for embeddings (compatible with OpenAI SDK)
const openrouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: EMBEDDING_BASE_URL,
})

// Helper: Extract topics from content
const extractTopics = (content: string, title: string): string[] => {
  const topics: string[] = []

  // Common methodology terms to detect
  const methodologyTerms = [
    'opener', 'permission', 'pitch', 'problem', 'discovery', 'example',
    'impact', 'root_cause', 'objection', 'closing', 'negative_frame',
    'gatekeeper', 'psychology', 'reactance', 'loss_aversion', 'attitude',
    'disqualification', 'mirroring', 'labeling', 'brush_off', 'pricing',
    'status_quo', 'timing', 'authority', 'talk_ratio', 'filler_words'
  ]

  const lowerContent = (content + ' ' + title).toLowerCase()
  for (const term of methodologyTerms) {
    if (lowerContent.includes(term.replace('_', ' ')) || lowerContent.includes(term)) {
      topics.push(term)
    }
  }

  return [...new Set(topics)]
}

// Parse markdown files into chunks by section
const parseMarkdownFile = async (filePath: string): Promise<KnowledgeChunk[]> => {
  const content = await fs.readFile(filePath, 'utf-8')
  const fileName = path.basename(filePath)
  const chunks: KnowledgeChunk[] = []

  // Split by H2 headers (##)
  const sections = content.split(/(?=^## )/m)

  for (const section of sections) {
    if (!section.trim()) continue

    // Extract title from first line
    const lines = section.trim().split('\n')
    let title = lines[0].replace(/^#+\s*/, '').trim()

    // If no H2, use the file name as title
    if (!title || !section.startsWith('##')) {
      title = fileName.replace('.md', '').replace(/^\d+-/, '').replace(/-/g, ' ')
    }

    const sectionContent = lines.slice(1).join('\n').trim()
    if (!sectionContent || sectionContent.length < 50) continue

    chunks.push({
      source: 'wiki',
      source_file: fileName,
      section_title: title,
      content: sectionContent,
      topics: extractTopics(sectionContent, title),
      metadata: {
        file_path: filePath,
        char_count: sectionContent.length,
      },
    })
  }

  // If no sections were created, create one for the whole file
  if (chunks.length === 0 && content.trim().length > 50) {
    chunks.push({
      source: 'wiki',
      source_file: fileName,
      section_title: fileName.replace('.md', '').replace(/^\d+-/, '').replace(/-/g, ' '),
      content: content.trim(),
      topics: extractTopics(content, fileName),
      metadata: {
        file_path: filePath,
        char_count: content.length,
      },
    })
  }

  return chunks
}

// Parse all wiki files
const parseWikiFiles = async (): Promise<KnowledgeChunk[]> => {
  const chunks: KnowledgeChunk[] = []

  try {
    const files = await fs.readdir(WIKI_DIR)
    const mdFiles = files.filter(f => f.endsWith('.md')).sort()

    console.log(`Found ${mdFiles.length} wiki files`)

    for (const file of mdFiles) {
      const filePath = path.join(WIKI_DIR, file)
      const fileChunks = await parseMarkdownFile(filePath)
      chunks.push(...fileChunks)
      console.log(`  - ${file}: ${fileChunks.length} chunks`)
    }
  } catch (error) {
    console.error('Error parsing wiki files:', error)
  }

  return chunks
}

// Parse personas from config
const parsePersonas = async (): Promise<KnowledgeChunk[]> => {
  const { PERSONAS, PERSONA_PROMPTS } = await import('../src/config/personas')
  const chunks: KnowledgeChunk[] = []

  for (const [id, persona] of Object.entries(PERSONAS)) {
    const prompt = PERSONA_PROMPTS[id] || ''
    const content = `
Name: ${persona.name}
Role: ${persona.role}
Personality: ${persona.personality}
Warmth Level: ${persona.warmth} (0=cold, 1=warm)
Common Objections: ${persona.objections.join(', ')}

Detailed Behavior:
${prompt}
    `.trim()

    chunks.push({
      source: 'persona',
      source_file: 'personas.ts',
      section_title: `${persona.name} - ${persona.role}`,
      content,
      topics: ['persona', persona.role.toLowerCase().replace(/\s+/g, '_'), ...persona.objections],
      metadata: {
        persona_id: id,
        warmth: persona.warmth,
        voice_id: persona.voiceId,
      },
    })
  }

  console.log(`Parsed ${chunks.length} personas`)
  return chunks
}

// Parse rubric from config
const parseRubric = async (): Promise<KnowledgeChunk[]> => {
  const { SCORING_RUBRIC } = await import('../src/config/rubric')
  const chunks: KnowledgeChunk[] = []

  for (const rubric of SCORING_RUBRIC) {
    const criteriaText = rubric.criteria
      .map(c => `- ${c.name}: ${c.description} (weight: ${c.weight * 100}%)`)
      .join('\n')

    const content = `
Scoring Dimension: ${rubric.dimension.replace('_', ' ').toUpperCase()}
Weight in Overall Score: ${rubric.weight * 100}%

Evaluation Criteria:
${criteriaText}

How to Score:
- Score each criterion as pass/fail based on the salesperson's behavior
- Calculate dimension score as percentage of criteria passed (0-10 scale)
- High score (8-10): Most criteria passed
- Medium score (5-7): Some criteria passed
- Low score (1-4): Few criteria passed
    `.trim()

    chunks.push({
      source: 'rubric',
      source_file: 'rubric.ts',
      section_title: `Scoring: ${rubric.dimension.replace('_', ' ')}`,
      content,
      topics: ['scoring', 'rubric', rubric.dimension, ...rubric.criteria.map(c => c.name)],
      metadata: {
        dimension: rubric.dimension,
        weight: rubric.weight,
        criteria_count: rubric.criteria.length,
      },
    })
  }

  console.log(`Parsed ${chunks.length} rubric dimensions`)
  return chunks
}

// Parse curriculum from config
const parseCurriculum = async (): Promise<KnowledgeChunk[]> => {
  const { CURRICULUM_MODULES } = await import('../src/config/curriculum')
  const chunks: KnowledgeChunk[] = []

  for (const module of CURRICULUM_MODULES) {
    const content = `
Module ${module.id}: ${module.name}
${module.description}

Topics Covered: ${module.topics.join(', ')}

Content:
${module.content}
    `.trim()

    chunks.push({
      source: 'curriculum',
      source_file: 'curriculum.ts',
      section_title: `Module ${module.id}: ${module.name}`,
      content,
      topics: ['curriculum', 'training', 'module', ...module.topics],
      metadata: {
        module_id: module.id,
        module_name: module.name,
      },
    })
  }

  console.log(`Parsed ${chunks.length} curriculum modules`)
  return chunks
}

// Generate embedding for text using OpenRouter
const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await openrouterClient.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // Limit to 8000 chars for safety
  })
  return response.data[0].embedding
}

// Upsert chunks to database
const upsertChunks = async (chunks: KnowledgeChunk[]): Promise<void> => {
  console.log(`\nGenerating embeddings and upserting ${chunks.length} chunks...`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    try {
      // Generate embedding
      const embeddingText = `${chunk.section_title}\n\n${chunk.content}`
      const embedding = await generateEmbedding(embeddingText)

      // Upsert to database
      const { error } = await supabase
        .from('knowledge_base')
        .upsert({
          source: chunk.source,
          source_file: chunk.source_file,
          section_title: chunk.section_title,
          content: chunk.content,
          topics: chunk.topics,
          metadata: chunk.metadata,
          embedding,
        }, {
          onConflict: 'source,source_file,section_title',
        })

      if (error) {
        console.error(`Error upserting chunk ${i + 1}: ${error.message}`)
        errorCount++
      } else {
        successCount++
        process.stdout.write(`\r  Progress: ${successCount}/${chunks.length} chunks`)
      }

      // Rate limiting: 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`\nError processing chunk ${i + 1}:`, error)
      errorCount++
    }
  }

  console.log(`\n\nIngestion complete: ${successCount} success, ${errorCount} errors`)
}

// Main function
const main = async () => {
  console.log('🚀 Starting Knowledge Base Ingestion\n')
  console.log('=' .repeat(50))

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
    process.exit(1)
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY')
    process.exit(1)
  }

  console.log('✅ Environment variables validated\n')

  // Collect all chunks
  const allChunks: KnowledgeChunk[] = []

  console.log('📚 Parsing content sources...\n')

  // Parse wiki files
  const wikiChunks = await parseWikiFiles()
  allChunks.push(...wikiChunks)

  // Parse personas
  const personaChunks = await parsePersonas()
  allChunks.push(...personaChunks)

  // Parse rubric
  const rubricChunks = await parseRubric()
  allChunks.push(...rubricChunks)

  // Parse curriculum
  const curriculumChunks = await parseCurriculum()
  allChunks.push(...curriculumChunks)

  console.log(`\n📊 Total chunks to ingest: ${allChunks.length}`)
  console.log('  - Wiki:', wikiChunks.length)
  console.log('  - Personas:', personaChunks.length)
  console.log('  - Rubric:', rubricChunks.length)
  console.log('  - Curriculum:', curriculumChunks.length)

  // Upsert to database
  await upsertChunks(allChunks)

  console.log('\n✅ Ingestion complete!')
  console.log('=' .repeat(50))
}

// Run
main().catch(console.error)
