#!/usr/bin/env npx tsx
/**
 * Test Knowledge Base Content for Giulio Methodology
 * Verifies that openers, pitch, and objections have correct canonical content from coldcallingwiki.com
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Text-based search (fallback for testing)
async function searchKnowledge(keywords: string[]) {
  // Build OR conditions for keywords
  const conditions = keywords.map(k => `content.ilike.%${k}%`).join(',')

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('section_title, content, source_file')
    .or(conditions)
    .limit(10)

  if (error) {
    console.error('Query Error:', JSON.stringify(error, null, 2))
    throw new Error(error.message || 'Query failed')
  }
  return data || []
}

interface TestCase {
  name: string
  searchKeywords: string[]
  mustContain: string[]
  mustNotContain: string[]
}

// Updated test cases based on actual coldcallingwiki.com content
const testCases: TestCase[] = [
  {
    name: 'Opener - Permission Based Philosophy',
    searchKeywords: ['permission-based', 'reactance', 'reciprocity'],
    mustContain: [
      'permission',
      'reactance',
    ],
    mustNotContain: [],
  },
  {
    name: 'Opener - Favourite Scripts (89% success)',
    searchKeywords: ['weren\'t expecting my call', 'list of 27'],
    mustContain: [
      "weren't expecting my call",
      "27",
      "89%",
    ],
    mustNotContain: [],
  },
  {
    name: 'Opener - Phone Out Window (79% success)',
    searchKeywords: ['throw your phone out the window', 'dreaded cold call'],
    mustContain: [
      "throw your phone out the window",
      "30 seconds",
      "79%",
    ],
    mustNotContain: [],
  },
  {
    name: 'Objection - Not Interested Response',
    searchKeywords: ['was my accent', 'hate sales calls'],
    mustContain: [
      'accent',
    ],
    mustNotContain: [],
  },
  {
    name: 'Objection - Framework (Pause/Accept/Permission)',
    searchKeywords: ['pause', 'accept and repeat', 'ask for permission'],
    mustContain: [
      'pause',
      'accept',
      'permission',
    ],
    mustNotContain: [],
  },
  {
    name: 'Objection - No Budget Response',
    searchKeywords: ['frustrating to operate', 'no money'],
    mustContain: [
      "frustrating to operate",
    ],
    mustNotContain: [],
  },
  {
    name: 'Objection - Send Email Response',
    searchKeywords: ['nine times out of ten', 'what does that actually mean'],
    mustContain: [
      "nine times out of ten",
    ],
    mustNotContain: [],
  },
  {
    name: 'Pitch Structure - Problem Focus',
    searchKeywords: ['problem', 'negative bias', '2x as likely'],
    mustContain: [
      'problem',
      '2x',
    ],
    mustNotContain: [],
  },
  {
    name: 'Pitch Template - Three Problems Format',
    searchKeywords: ['I have a feeling', 'opposite problem'],
    mustContain: [
      "I have a feeling you'll tell me",
      "opposite problem",
    ],
    mustNotContain: [],
  },
  {
    name: 'Call Structure - 9 Steps',
    searchKeywords: ['opener', 'pitch', 'problem', 'example', 'impact'],
    mustContain: [
      'opener',
      'pitch',
      'problem',
      'example',
      'impact',
      'root cause',
      'summary',
      'closing',
    ],
    mustNotContain: [],
  },
  {
    name: 'Closing - Low Commitment Close',
    searchKeywords: ['crying into my coffee', 'bad idea to sit down'],
    mustContain: [
      'crying into my coffee',
    ],
    mustNotContain: [],
  },
  {
    name: 'Gatekeeper - Scripts',
    searchKeywords: ['gatekeeper', 'put me through'],
    mustContain: [
      'gatekeeper',
    ],
    mustNotContain: [],
  },
]

async function runTests() {
  console.log('🧪 Testing Knowledge Base Content (coldcallingwiki.com)\n')
  console.log('='.repeat(60))

  let passed = 0
  let failed = 0

  for (const test of testCases) {
    console.log(`\n📝 Test: ${test.name}`)
    console.log(`   Keywords: ${test.searchKeywords.slice(0, 2).join(', ')}...`)

    try {
      const results = await searchKnowledge(test.searchKeywords)

      if (results.length === 0) {
        console.log('   ❌ FAILED: No results returned')
        failed++
        continue
      }

      // Combine all content for checking
      const combinedContent = results
        .map((r: any) => `${r.section_title} ${r.content}`)
        .join(' ')
        .toLowerCase()

      let testPassed = true
      const issues: string[] = []

      // Check must contain
      for (const phrase of test.mustContain) {
        if (!combinedContent.includes(phrase.toLowerCase())) {
          testPassed = false
          issues.push(`Missing: "${phrase}"`)
        }
      }

      // Check must not contain
      for (const phrase of test.mustNotContain) {
        if (combinedContent.includes(phrase.toLowerCase())) {
          testPassed = false
          issues.push(`Should NOT contain: "${phrase}"`)
        }
      }

      if (testPassed) {
        console.log('   ✅ PASSED')
        console.log(`   Found in: ${results.slice(0, 2).map((r: any) => r.section_title).join(', ')}`)
        passed++
      } else {
        console.log('   ❌ FAILED')
        issues.forEach(i => console.log(`     ${i}`))
        failed++
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`)
      failed++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`)

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Knowledge base has correct Giulio methodology from coldcallingwiki.com.')
  } else {
    console.log('\n⚠️  Some tests failed. Review the knowledge base content.')
    process.exit(1)
  }
}

runTests().catch(console.error)
