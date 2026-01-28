#!/usr/bin/env npx tsx
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { searchKnowledgeBase } from '../src/lib/knowledge'

async function main() {
  console.log('Testing search for openers...\n')
  const results = await searchKnowledgeBase('give me 5 cold call openers', { limit: 6 })

  console.log('Found', results.length, 'results:\n')
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.section_title}`)
    console.log(`   Source: ${r.source_file}`)
    console.log(`   Preview: ${r.content.substring(0, 150).replace(/\n/g, ' ')}...\n`)
  })
}

main().catch(console.error)
