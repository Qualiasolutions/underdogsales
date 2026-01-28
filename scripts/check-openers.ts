#!/usr/bin/env npx tsx
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Directly query for opener content
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, section_title, source_file, content')
    .ilike('section_title', '%Opener%')

  if (error) {
    console.error(error)
    return
  }

  console.log('Entries with "Opener" in title:', data?.length || 0)
  data?.forEach((d: any) => {
    console.log('\n---')
    console.log('Title:', d.section_title)
    console.log('Source:', d.source_file)
    console.log('Content preview:', d.content?.substring(0, 300))
  })
}

main()
