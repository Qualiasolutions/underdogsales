#!/usr/bin/env npx tsx
/**
 * Update embeddings for knowledge base entries that don't have them
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openrouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
})

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openrouterClient.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}

async function main() {
  console.log('🔍 Finding entries without embeddings...')

  // Get entries without embeddings
  const { data: entries, error } = await supabase
    .from('knowledge_base')
    .select('id, section_title, content')
    .is('embedding', null)

  if (error) {
    console.error('Error fetching entries:', error)
    return
  }

  console.log(`📊 Found ${entries?.length || 0} entries without embeddings`)

  for (const entry of entries || []) {
    try {
      const text = `${entry.section_title}\n\n${entry.content}`
      console.log(`  Processing: ${entry.section_title}`)
      const embedding = await generateEmbedding(text)

      const { error: updateError } = await supabase
        .from('knowledge_base')
        .update({ embedding })
        .eq('id', entry.id)

      if (updateError) {
        console.error(`  ❌ Error updating: ${entry.section_title}`, updateError)
      } else {
        console.log(`  ✅ Updated: ${entry.section_title}`)
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 150))
    } catch (err) {
      console.error(`  ❌ Error processing: ${entry.section_title}`, err)
    }
  }

  console.log('\n✅ Done!')
}

main().catch(console.error)
