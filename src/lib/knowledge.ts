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
    similarity?: number
}

interface KnowledgeBaseRow {
    id: string
    source: string
    source_file: string
    section_title: string | null
    content: string
    topics: string[] | null
    rrf_score?: number
}

interface SearchOptions {
    limit?: number
    threshold?: number
    source?: string
}

// Module-level constant to avoid recreating on every search call
const STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'about', 'give', 'get', 'make', 'want', 'tell', 'show', 'help'])

// Escape SQL LIKE special characters to prevent query manipulation
function escapeLikePattern(term: string): string {
    return term.replace(/[%_\\]/g, '\\$&')
}

// Extract keywords for text-based search
function extractKeywords(query: string): string[] {
    return query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word))
}

// Text-based search as primary method (vector search has schema issues)
async function textBasedSearch(
    query: string,
    options: SearchOptions
): Promise<KnowledgeResult[]> {
    const { limit = 5, source } = options
    const supabase = getAdminClient()

    // Extract keywords from query
    const keywords = extractKeywords(query)

    // Map common query terms to section titles for direct matching
    const sectionMappings: Record<string, string[]> = {
        'opener': ['Cold Call Openers - Favourite Scripts', 'Cold Call Openers - Other Good Scripts', 'Cold Call Openers - Philosophy', 'Openers'],
        'openers': ['Cold Call Openers - Favourite Scripts', 'Cold Call Openers - Other Good Scripts', 'Cold Call Openers - Philosophy', 'Openers'],
        'open': ['Cold Call Openers - Favourite Scripts', 'Openers'],
        'pitch': ['Sales Pitch - Template', 'Sales Pitch - Philosophy', 'Pitch'],
        'objection': ['Objection Handling - Brush-Offs', 'Objection Handling - Pricing', 'Objection Handling - Status Quo', 'Sales Objections - Types', 'Objections'],
        'objections': ['Objection Handling - Brush-Offs', 'Objection Handling - Pricing', 'Objection Handling - Status Quo', 'Sales Objections - Types', 'Objections'],
        'handle': ['Objection Handling', 'Framework'],
        'interested': ['Brush-Offs', 'Not Interested'],
        'budget': ['Pricing Objections', 'Budget'],
        'email': ['Brush-Offs', 'Send Email'],
        'busy': ['Brush-Offs', 'Busy'],
        'structure': ['Cold Call Structure - Complete Framework', 'Call Structure'],
        'call': ['Cold Call Structure', 'Cold Call Openers', 'Openers'],
        'cold': ['Cold Call Openers', 'Cold Call Structure', 'Openers'],
        'close': ['Closing Techniques', 'Close'],
        'closing': ['Closing Techniques', 'Close'],
        'gatekeeper': ['Getting Past the Gatekeeper', 'Gatekeeper'],
        'psychology': ['Sales Psychology - Key Principles', 'Psychology'],
        'framework': ['Sales Objections - Types and Framework', 'Framework'],
    }

    // Build search terms based on query
    const searchTerms: string[] = []
    for (const keyword of keywords) {
        if (sectionMappings[keyword]) {
            searchTerms.push(...sectionMappings[keyword])
        }
    }

    // Add original keywords
    searchTerms.push(...keywords)

    // Remove duplicates
    const uniqueTerms = [...new Set(searchTerms)]

    // Build OR conditions for section_title and content search
    // Escape SQL LIKE special characters to prevent query manipulation
    const conditions = uniqueTerms
        .slice(0, 10) // Limit to 10 terms
        .map(term => {
            const escaped = escapeLikePattern(term)
            return `section_title.ilike.%${escaped}%,content.ilike.%${escaped}%`
        })
        .join(',')

    // First, try to get canonical coldcallingwiki.com content
    const canonicalQuery = supabase
        .from('knowledge_base')
        .select('id, source, source_file, section_title, content, topics')
        .ilike('source_file', '%coldcallingwiki%')

    if (conditions) {
        canonicalQuery.or(conditions)
    }

    const { data: canonicalData, error: canonicalError } = await canonicalQuery.limit(limit)

    // Then get other wiki content as fallback
    let queryBuilder = supabase
        .from('knowledge_base')
        .select('id, source, source_file, section_title, content, topics')
        .not('source_file', 'ilike', '%coldcallingwiki%')

    if (source) {
        queryBuilder = queryBuilder.eq('source', source)
    }

    if (conditions) {
        queryBuilder = queryBuilder.or(conditions)
    }

    const { data: otherData, error: otherError } = await queryBuilder.limit(limit * 2)

    // Combine results, prioritizing canonical content
    const data = [
        ...(canonicalData || []),
        ...(otherData || []),
    ]

    const error = canonicalError || otherError

    if (error) {
        logger.error('Text-based search error', { error: error.message })
        return []
    }

    // Score results by keyword matches
    const scored = (data || []).map((item: KnowledgeBaseRow) => {
        const text = `${item.section_title || ''} ${item.content}`.toLowerCase()
        const title = (item.section_title || '').toLowerCase()
        let score = 0

        // HEAVILY prioritize canonical coldcallingwiki.com content
        if (item.source_file?.includes('coldcallingwiki')) {
            score += 100
        }

        // Extra boost for specific canonical sections
        if (title.includes('favourite scripts') || title.includes('favorite scripts')) {
            score += 80 // Opener scripts
        }
        if (title.includes('brush-off') || title.includes('brush off')) {
            score += 60 // Objection scripts
        }
        if (title.includes('template') || title.includes('example')) {
            score += 50 // Pitch templates
        }
        if (title.includes('complete framework')) {
            score += 50 // Call structure
        }

        // Score by keyword matches in title (higher priority)
        for (const keyword of keywords) {
            if (title.includes(keyword)) {
                score += 30
            }
        }

        // Score by mapped terms in title
        for (const term of uniqueTerms) {
            if (title.includes(term.toLowerCase())) {
                score += 25
            }
        }

        // Score by keyword matches in content
        for (const term of uniqueTerms) {
            if (text.includes(term.toLowerCase())) {
                score += 5
            }
        }

        return { ...item, score }
    })

    // Sort by score and return top results
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...item }) => item as KnowledgeResult)
}

/**
 * Hybrid search using RRF (Reciprocal Rank Fusion)
 * Combines vector similarity and full-text search for better results
 */
async function hybridSearch(
    query: string,
    options: SearchOptions
): Promise<KnowledgeResult[]> {
    const { limit = 5, source } = options
    const startTime = Date.now()
    const supabase = getAdminClient()

    // Generate embedding for vector search component
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
    const embeddingString = `[${queryEmbedding.join(',')}]`

    const embeddingTime = Date.now() - startTime

    // Execute hybrid search
    const searchStart = Date.now()
    const { data, error } = await supabase.rpc('hybrid_search_knowledge', {
        query_text: query.trim(),
        query_embedding: embeddingString,
        match_count: limit,
        filter_source: source ?? null,
    })

    const searchTime = Date.now() - searchStart
    const totalTime = Date.now() - startTime

    logger.info('Hybrid search completed', {
        operation: 'hybrid_search',
        embeddingMs: embeddingTime,
        searchMs: searchTime,
        totalMs: totalTime,
        resultCount: data?.length ?? 0,
    })

    if (error) {
        logger.error('Hybrid search error', { error: error.message })
        throw error
    }

    return (data || []).map((item: KnowledgeBaseRow) => ({
        id: item.id,
        source: item.source,
        source_file: item.source_file,
        section_title: item.section_title || '',
        content: item.content,
        topics: item.topics || [],
        similarity: item.rrf_score,
    }))
}

export async function searchKnowledgeBase(
    query: string,
    options: SearchOptions = {}
): Promise<KnowledgeResult[]> {
    const { limit = 5, threshold = 0.5, source } = options

    if (!query.trim()) {
        return []
    }

    // Try hybrid search first (combines vector + full-text with RRF)
    try {
        const hybridResults = await hybridSearch(query, options)
        if (hybridResults.length > 0) {
            return hybridResults
        }
    } catch (error) {
        logger.warn('Hybrid search failed, falling back to text search', { error: String(error) })
    }

    // Fallback to text-based search
    try {
        const textResults = await textBasedSearch(query, options)
        if (textResults.length > 0) {
            logger.info('Knowledge search success (text-based fallback)', { resultCount: textResults.length })
            return textResults
        }
    } catch (error) {
        logger.exception('Text-based search failed', error)
    }

    // Final fallback to pure vector search
    try {
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
        const embeddingString = `[${queryEmbedding.join(',')}]`

        const supabase = getAdminClient()

        const { data, error } = await supabase.rpc('match_knowledge', {
            query_embedding: embeddingString,
            match_threshold: threshold,
            match_count: limit,
            filter_source: source ?? undefined,
        })

        if (error) {
            logger.error('Vector search error', { error: error.message })
            return []
        }

        logger.info('Knowledge search success (vector fallback)', { resultCount: data?.length ?? 0 })

        return (data || []).map((item: KnowledgeBaseRow & { similarity?: number }) => ({
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
