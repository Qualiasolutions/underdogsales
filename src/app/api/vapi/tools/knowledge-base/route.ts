import { NextRequest, NextResponse } from 'next/server'
import { searchKnowledgeBase } from '@/lib/knowledge'
import { z } from 'zod'

// Schema for VAPI tool call validation
const KnowledgeToolSchema = z.object({
    message: z.object({
        toolCalls: z.array(z.object({
            id: z.string(),
            type: z.literal('function'),
            function: z.object({
                name: z.string(),
                arguments: z.string().or(z.object({ query: z.string() }))
            })
        }))
    })
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log('VAPI Knowledge Tool Request:', JSON.stringify(body, null, 2))

        // VAPI sends the tool call in a specific format. 
        // We expect the function name "queryKnowledgeBase" and argument "query"

        // Simple parsing to extract the query from the first tool call
        // Note: In production, use Zod to validate the full structure if strictness is needed
        // But VAPI's payload structure can vary slightly depending on configuration.

        const toolCall = body.message?.toolCalls?.[0];

        if (!toolCall) {
            return NextResponse.json({ results: [] });
        }

        const { id, function: func } = toolCall;

        if (func.name !== 'queryKnowledgeBase') {
            // Not our function?
            return NextResponse.json({ results: [] });
        }

        let query = '';

        if (typeof func.arguments === 'string') {
            try {
                const args = JSON.parse(func.arguments);
                query = args.query;
            } catch (e) {
                console.error("Failed to parse arguments string", e);
            }
        } else {
            query = func.arguments?.query;
        }

        if (!query) {
            return NextResponse.json({
                results: [{
                    toolCallId: id,
                    result: "No query provided."
                }]
            });
        }

        console.log(`Searching knowledge base for: "${query}"`);

        const results = await searchKnowledgeBase(query, {
            limit: 3,
            threshold: 0.6 // Higher threshold for voice to avoid irrelevant noise
        });

        // Format for VAPI to speak
        // We return a logical string that the model can interpret
        const context = results.length > 0
            ? results.map(r => r.content).join('\n\n')
            : "No relevant information found in the knowledge base.";

        return NextResponse.json({
            results: [{
                toolCallId: id,
                result: context
            }]
        });

    } catch (error) {
        console.error('VAPI Knowledge Tool Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
