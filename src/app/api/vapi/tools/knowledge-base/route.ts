import { NextRequest, NextResponse } from 'next/server'
import { searchKnowledgeBase } from '@/lib/knowledge'
import { verifyVapiRequest } from '@/lib/vapi/auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
    try {
        // Get raw body for signature verification
        const rawBody = await request.text()

        // Verify VAPI signature
        const verificationError = verifyVapiRequest(
            rawBody,
            request.headers.get('x-vapi-signature')
        )
        if (verificationError) {
            return NextResponse.json(
                { error: verificationError.error },
                { status: verificationError.status }
            )
        }

        const body = JSON.parse(rawBody)

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

        if (func.name !== 'search_knowledge') {
            // Not our function - check legacy name for backwards compatibility
            if (func.name !== 'queryKnowledgeBase') {
                return NextResponse.json({ results: [] });
            }
        }

        let query = '';

        if (typeof func.arguments === 'string') {
            try {
                const args = JSON.parse(func.arguments);
                query = args.query;
            } catch (e) {
                logger.exception('Failed to parse VAPI arguments', e, { operation: 'vapi_knowledge' })
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

        const results = await searchKnowledgeBase(query, {
            limit: 3,
            threshold: 0.55 // Standardized threshold
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
        logger.exception('VAPI Knowledge Tool Error', error, { operation: 'vapi_knowledge' })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
