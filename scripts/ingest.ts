import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdf = require('pdf-parse')
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openRouterKey = process.env.OPENROUTER_API_KEY

if (!supabaseUrl || !supabaseKey || !openRouterKey) {
    console.error('Missing environment variables. Check .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const openai = new OpenAI({
    apiKey: openRouterKey,
    baseURL: 'https://openrouter.ai/api/v1',
})

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

// Directories to process
const SOURCE_DIRS = [
    'Cheatsheets others-20260115T213353Z-1-001 (2)/Cheatsheets others',
    'Cheatsheets-20260115T213352Z-1-001 (2)/Cheatsheets',
    'Solo Voice_ Cold Calling Course-20260115T213356Z-1-001 (2)/Solo Voice_ Cold Calling Course',
]

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
    })
    return response.data[0].embedding
}

function chunkText(text: string): string[] {
    const chunks: string[] = []
    let startIndex = 0

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + CHUNK_SIZE, text.length)
        let chunk = text.slice(startIndex, endIndex)

        // Try to break at a period or newline if possible
        if (endIndex < text.length) {
            const lastPeriod = chunk.lastIndexOf('.')
            const lastNewline = chunk.lastIndexOf('\n')
            const breakPoint = Math.max(lastPeriod, lastNewline)

            if (breakPoint > CHUNK_SIZE * 0.5) {
                chunk = chunk.slice(0, breakPoint + 1)
                startIndex += (breakPoint + 1) - CHUNK_OVERLAP
            } else {
                startIndex += CHUNK_SIZE - CHUNK_OVERLAP
            }
        } else {
            startIndex += CHUNK_SIZE
        }

        chunks.push(chunk.trim())
    }

    return chunks.filter(c => c.length > 50) // Filter very small chunks
}

async function processFile(filePath: string, sourceCategory: string) {
    console.log(`Processing: ${filePath} ...`)

    try {
        const dataBuffer = fs.readFileSync(filePath)
        const data = await pdf(dataBuffer)
        const text = data.text

        if (!text || text.trim().length === 0) {
            console.warn(`Empty text for ${filePath}`)
            return
        }

        const chunks = chunkText(text)
        const filename = path.basename(filePath)

        console.log(`  - Generated ${chunks.length} chunks`)

        for (const [index, chunk] of chunks.entries()) {
            const embedding = await generateEmbedding(chunk)

            const { error } = await supabase.from('knowledge_base').insert({
                source: sourceCategory,
                source_file: filename,
                section_title: `Chunk ${index + 1}`,
                content: chunk,
                embedding,
                metadata: {
                    chunk_index: index,
                    total_chunks: chunks.length,
                    page_count: data.numpages
                }
            })

            if (error) {
                console.error(`  - Error inserting chunk ${index}:`, error.message)
            }
        }
        console.log(`  - Completed ${filename}`)
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err)
    }
}

async function main() {
    for (const dir of SOURCE_DIRS) {
        const fullPath = path.resolve(process.cwd(), dir)
        let category = 'wiki' // Default, constraint-valid

        if (dir.includes('Solo Voice')) category = 'curriculum'
        // 'Cheatsheets' also uses 'wiki' since 'cheatsheet' is not valid per constraint

        if (fs.existsSync(fullPath)) {
            // Recursive walk for subdirectories (especially for Course content)
            const processDir = async (directory: string) => {
                const files = fs.readdirSync(directory)
                for (const file of files) {
                    const filePath = path.join(directory, file)
                    const stat = fs.statSync(filePath)

                    if (stat.isDirectory()) {
                        await processDir(filePath)
                    } else if (file.toLowerCase().endsWith('.pdf')) {
                        await processFile(filePath, category)
                    }
                }
            }
            await processDir(fullPath)
        } else {
            console.warn(`Directory not found: ${fullPath}`)
        }
    }
}

main().catch(console.error)
