#!/usr/bin/env node
/**
 * Script to create Retell agents for all personas
 * Run with: node scripts/create-retell-agents.mjs
 */

import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || 'key_32452212c41c626b33cf6d13fb9d';

const retell = new Retell({ apiKey: RETELL_API_KEY });

const personas = [
  {
    id: 'skeptical_cfo',
    name: 'Sarah Chen (CFO)',
    llmId: 'llm_7d712e3e514c9a020a3a8a2b129d',
    voiceId: '11labs-Susan', // Retell voice
  },
  {
    id: 'busy_vp_sales',
    name: 'Marcus Johnson (VP of Sales)',
    llmId: 'llm_75872100b059849e942028f19049',
    voiceId: '11labs-Jason', // Retell voice
  },
  {
    id: 'friendly_gatekeeper',
    name: 'Emily Torres (Executive Assistant)',
    llmId: 'llm_9ac0633fe962d883660490a80fb7',
    voiceId: '11labs-Emily', // Retell voice
  },
  {
    id: 'defensive_manager',
    name: 'David Park (Sales Manager)',
    llmId: 'llm_e49aced20de27e552e52f94890ed',
    voiceId: '11labs-Brian', // Retell voice
  },
  {
    id: 'interested_but_stuck',
    name: 'Lisa Martinez (Head of Operations)',
    llmId: 'llm_d3a6d5fe2283c42512fa19d939e4',
    voiceId: '11labs-Julia', // Retell voice
  },
  {
    id: 'aggressive_closer',
    name: 'Tony Ricci (Sales Director)',
    llmId: 'llm_48edb74254db4be0ddad78388fc0',
    voiceId: '11labs-Anthony', // Retell voice
  },
];

async function createAgents() {
  console.log('Creating Retell agents...\n');

  const results = {};

  for (const persona of personas) {
    try {
      console.log(`Creating agent: ${persona.name}...`);

      const agent = await retell.agent.create({
        agent_name: persona.name,
        response_engine: {
          type: 'retell-llm',
          llm_id: persona.llmId,
        },
        voice_id: persona.voiceId,
        enable_backchannel: true,
        language: 'en-US',
      });

      results[persona.id] = agent.agent_id;
      console.log(`  ✓ Created: ${agent.agent_id}\n`);
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}\n`);
      results[persona.id] = null;
    }
  }

  console.log('\n=== AGENT IDS ===\n');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

createAgents().catch(console.error);
