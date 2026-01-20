import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing connection to:', supabaseUrl)
console.log('Key length:', supabaseKey?.length)

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function test() {
    console.log('Attempting simple SELECT...')
    const { count, error } = await supabase.from('knowledge_base').select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Success! Row count:', count)
    }
}

test()
