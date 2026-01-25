import OpenAI from 'openai'
import { logger } from './logger'
import { openrouterCircuit } from './circuit-breaker'
import { getAdminClient } from './supabase/admin'

export interface KnowledgeResult {
    id: string
    source: string
    source_file: string
    section_title: string
    content: string
    topics: string[]
    similarity: number
}

interface SearchOptions {
    limit?: number
    threshold?: number
    source?: string
}

export async function searchKnowledgeBase(
    query: string,
    options: SearchOptions = {}
): Promise<KnowledgeResult[]> {
    const { limit = 5, threshold = 0.5, source } = options

    if (!query.trim()) {
        return []
    }

    try {
        // Generate embedding with circuit breaker protection
        const openrouterClient = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
        })

        const embeddingResponse = await openrouterCircuit.execute(() =>
            openrouterClient.embeddings.create({
                model: 'openai/text-embedding-3-small',
                input: query.trim(),
            })
        )
        const queryEmbedding = embeddingResponse.data[0].embedding
        // Convert to pgvector string format
        const embeddingString = `[${queryEmbedding.join(',')}]`

        // Search Supabase using admin client
        const supabase = getAdminClient()

        const { data, error } = await supabase.rpc('match_knowledge', {
            query_embedding: embeddingString,
            match_threshold: threshold,
            match_count: limit,
            filter_source: source ?? undefined,
        })

        if (error) {
            logger.error('Knowledge base search error', { error: error.message })
            throw error
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            source: item.source,
            source_file: item.source_file,
            section_title: item.section_title || '',
            content: item.content,
            topics: item.topics || [],
            similarity: item.similarity,
        }))
    } catch (error) {
        logger.exception('Knowledge search failed', error)
        return []
    }
}
