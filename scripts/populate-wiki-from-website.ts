#!/usr/bin/env npx tsx
/**
 * Populate Knowledge Base from Cold Calling Wiki Website
 * This script replaces ALL wiki content with canonical content from coldcallingwiki.com
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openrouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
})

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openrouterClient.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}

// CANONICAL CONTENT FROM COLDCALLINGWIKI.COM
const wikiContent = [
  // ============ OPENERS ============
  {
    section_title: 'Cold Call Openers - Philosophy',
    content: `## Permission-Based Openers (PBOs)

First impressions count; a strong opener will help set the tone.

I'm a fan of Permission-Based Openers (PBOs). I prefer to give prospects a way out of the call.

This is because of Reactance and Reciprocity, two psychological principles all humans obey.

In short, be nice and give people freedom, and they'll react better. Pushing your pitch on them will often trigger resistance.

I'm also a fan of putting some humour there. Something else most humans appreciate.

They can all work, so pick your favourite. It's crucial that it'll naturally lead to a problem statement: The Pitch.`,
    source_file: 'coldcallingwiki.com/docs/openers',
  },
  {
    section_title: 'Cold Call Openers - Favourite Scripts',
    content: `## MY FAVOURITE OPENERS (with success rates)

### OPENER 1 (89% success rate out of 400+ calls):
"Hi, {name}, you weren't expecting my call, but I hope you can help. You're part of a list of 27 {ICP} I'd like to work with. Can you help me understand if it's relevant?"

WHY IT WORKS:
- Tickles ego
- Specific (the number 27)
- Asks for help twice
- Doesn't sound salesy

WHEN TO USE: You're targeting a specific account list (ABM). You're ringing people who don't respond well to sales calls.

### OPENER 2 (79% success rate out of 600+ calls):
"I'll be upfront, {name}, it's a dreaded cold call. Do you want to throw your phone out the window now, or let me have 30 seconds and then decide?"

WHY IT WORKS:
- Honesty
- Humour
- Permission-based
- Clear time ask

WHEN TO USE: You have a big list and want a reliable, fun, direct opener.`,
    source_file: 'coldcallingwiki.com/docs/openers',
  },
  {
    section_title: 'Cold Call Openers - Other Good Scripts',
    content: `## OTHER GOOD OPENERS

### For Enterprise/Navigation:
"Hi {name}, can you help me understand who's in charge of {ICP function}?"
- Info, rather than selling
- Disarming
- Direct
USE: Navigate through a large company, great for Enterprise.

### Trigger-Based:
"Hi {name}. I'm calling regarding {trigger, e.g. hiring}. Has that changed?"
- Curiosity
- Personalised
USE: You have specific triggers – great for Enterprise.

### For C-Levels:
"I'll be completely honest {name}, this is a sales call. You can hang up now, or let me have 30 seconds. It's up to you."
- Honesty
- Clear time frame
- Permission-based
USE: You're dealing with C-levels and want a strong opener.

### Challenging Opener:
"If I told you this was a sales call, would you tell me you hate salespeople?"
- Direct
- No one wants to be hateful
USE: You know how to navigate a difficult conversation and you like to challenge – best for C-level or salespeople.

### Pre-handle Objections:
"If I told you this was a sales call about X, I guess you'd tell me Y."
Example: "If I told you this was a call about SEO optimisation, you would tell me you get more traffic than you can handle."
- Addresses objection upfront
- Direct
- Honest
USE: You're always facing the same objections and want to handle them upfront.

### Follow-up Opener:
"Hi {name}, this is Giulio Segantini from Underdog Sales. Does that ring a bell?"
- Familiarity
- Curiosity
USE: You've been in touch or already reached out via other channels.

### Multi-channel Follow-up:
"Hi {name}, this is Giulio Segantini from Underdog Sales. I sent you an email/DM about {pain}. Did I completely miss the mark?"
- Familiarity
- Multichannel
USE: You're following up on a previous outreach like email or DM.`,
    source_file: 'coldcallingwiki.com/docs/openers',
  },
  {
    section_title: 'Cold Call Openers - What NOT to Say',
    content: `## OPENERS I DO NOT RECOMMEND

### Direct Selling (not recommended):
"Hi {name}, I'll be direct. I am selling X. Are you interested?"
- Too direct, no rapport

### The Boring Intro (NEVER use):
"Hi {name}, this is Giulio from Underdogsales. I'm calling because we do business in [segment] to achieve [result]."
- Everyone uses it
- Every time you do, somewhere in the world a prospect dies of boredom.

### Fake Interest (NEVER use):
"Hi {name}, this is Giulio from Underdogsales. How are you today?"
- You don't actually care how they are
- Feels fake and salesy

## POST OPENER - What to do if they don't agree to let you pitch

If they understood it's a sales call:
"Let me briefly explain; if you're bored by the end, you'll never hear my accent again, fair?"

If they have not understood:
"To be clear, it's a sales call. Can I give you the context, and you can decide if it's relevant?"

If you are DENIED permission:
Jump directly to Objection Handling.`,
    source_file: 'coldcallingwiki.com/docs/openers',
  },

  // ============ PITCH ============
  {
    section_title: 'The Sales Pitch - Philosophy',
    content: `## WHY FOCUS ON PROBLEMS (Not Benefits)

You probably focus your pitch on the benefits your product/service offers.

There are three issues with that:
1. You'll sound like most salespeople
2. Humans are naturally sceptical of positive selling
3. Humans are wired to focus on negative information

According to both Negative Bias and Risk Aversion, humans are 2x as likely to prioritise fixing a problem than gaining a benefit.

Therefore, prospects are more likely to listen if you focus on their problems.

A crystal clear understanding of their problems is crucial to success.`,
    source_file: 'coldcallingwiki.com/docs/the-pitch',
  },
  {
    section_title: 'The Sales Pitch - Template and Example',
    content: `## PITCH TEMPLATE

"Our clients are {qualifying adjective} {well-defined ICP} who see a couple of obstacles to {desired outcome}:

- {Problem 1 + Consequence}
- {Problem 2 + Consequence}
- {Problem 3 + Consequence}

I have a feeling you'll tell me you have the opposite problem; {opposite problem, exaggerated}."

## REAL EXAMPLE (Giulio's own pitch):

"My clients are ambitious Founders of B2B SaaS who see a couple of obstacles to consistent growth:

For example, their sales process is not predictable, meaning they don't have a consistent pipeline of new opportunities.

Alternatively, they get plenty of meetings, but they're not properly qualified for the problems they fix, resulting in endless chasing and heavy discounting to close deals.

I have a feeling you'll tell me you've got the opposite problem; you couldn't handle one more client, and I'm barking up the wrong phone."

## WHY THIS WORKS:
- Notice the pitch is NOT about cold calling
- That's not the pressing, underlying problem
- If you've got plenty of well-qualified meetings, why the hell would you cold call?
- Focus on the REAL problems your prospects have`,
    source_file: 'coldcallingwiki.com/docs/the-pitch',
  },

  // ============ OBJECTIONS ============
  {
    section_title: 'Sales Objections - Types and Framework',
    content: `## TYPES OF OBJECTIONS

**1. Brush-offs**
This is like a knee-jerk reaction. The equivalent of "I have no change" if a homeless person is drifting towards you.

They're the short, to-the-point responses, highlighting the person doesn't see value in talking to you.

They require you to lower their guard first.

**2. Real Objections**
These are sometimes brush-offs and sometimes real objections (I just signed a contract). Your job is to determine whether they're a smoke screen.

Sometimes, there will be a genuine belief behind the objections (We don't need this); your job is to challenge that through good questions.

## THE OBJECTION HANDLING FRAMEWORK

**1. Pause**
Pause for 2-3 seconds.
Why: It gives you time to think AND slow down.

**2. Accept and repeat (if needed)**
Examples:
- "I thought you might say that."
- "Ouch, it must be frustrating to operate without budget."
- "I'm not surprised, [competitor] is great."
Why: It's the only way to reduce tension.

**3a. Ask for permission**
"Do you mind if I ask a question about that/one last question?"
Why: Asking for permission gives control to the buyer and helps build rapport.

**3b. Ask a question right away (for very direct objections like "not interested")**
Why: With very direct objections, ask immediately or you may lose the conversation.

## TONALITY
❌ Sarcasm
❌ High-pitched
❌ Annoyed
✅ Calm
✅ Curious
✅ Cool

## POST-OBJECTION
- Mirror the 1-3 crucial words to get the prospect to open up
- Label emotions: "It sounds/seems/looks/feels..."
- Ask questions to dig into the pain/problem further
- If faced with another objection, restart the process`,
    source_file: 'coldcallingwiki.com/docs/objections-wiki',
  },
  {
    section_title: 'Objection Handling - Pricing Objections',
    content: `## PRICING OBJECTIONS

### "We don't have any budget."
RESPONSE: "It must be frustrating to operate with no money."
[Pause]
"I'm assuming even if you had budget, this wouldn't be a priority anyway, right?"

### "It's too expensive."
RESPONSE: "Oh I don't get that a lot."

Option 1: "Do you mind if I ask a stupid question? Does that mean you're currently perfectly satisfied for a much cheaper price?"

Option 2: "Does that mean this problem is not worth spending more on, or you simply don't have the problem?"`,
    source_file: 'coldcallingwiki.com/docs/objections-wiki',
  },
  {
    section_title: 'Objection Handling - Status Quo Objections',
    content: `## STATUS QUO OBJECTIONS

### "We're fine/good, thanks."
When they say "fine":
- "Is that because you genuinely don't have problem X, or you don't trust someone cold calling you could help?"
- "You meant to say perfect, didn't you?"
- "You don't believe it can be done better?"
- "You can't handle any more business?"
- "You don't believe a third party can help?"
- "Are you telling me that just to get rid of me?"

### "We already have a supplier/something in place."
RESPONSE: "I thought you would, at least you are relevant for our offer."
- "Does that mean everything is perfect?"
- "What are they doing so well that deserves your loyalty?"
- "If you could build your own system from scratch, what's one problem we and our competitors can't seem to fix 100%?"
- "When you say you already have a supplier, can I ask if it's not your brother-in-law's company by any chance?"

### "No."
RESPONSE: "Good. So, that means you can consider an alternative supplier if you believe it's better, without any guilt?"
- "Ok, and you've decided never to look at other suppliers, even if what they could do better?"
- "Are you saying you don't believe it could be done better?"
- "So, have you never changed suppliers before?"
- "Would your supplier be jealous we're speaking right now?"

### "It looks quite similar to what we already have."
RESPONSE: "Oh, that's the first time I hear that!"
"When you say it looks similar, what do you mean, exactly?"

### "We don't need this at the moment."
RESPONSE: "That's not surprising; I thought you may have already fixed the problem; would you be opposed to sharing how?"

### "We don't want to change our current system/processes."
RESPONSE: "It sounds like you have everything under control."
"Is that because everything works perfectly or because changing things would be too painful?"

### "It's not the right time for this."
RESPONSE: "I do usually have horrible timing."
"Does that mean you don't need this at all, or are other priorities completely taking over your schedule?"`,
    source_file: 'coldcallingwiki.com/docs/objections-wiki',
  },
  {
    section_title: 'Objection Handling - Brush-Offs',
    content: `## BRUSH-OFF OBJECTIONS

### "I don't take sales/cold calls."
RESPONSES:
- "You don't take any cold calls or just the bad ones?"
- "If I call you back tomorrow, is that still a cold call?"

### "Please send me an email" (right away)
RESPONSE: "Of course, I can."
"What's the best email to reach you on?"
"Before I do, would you be opposed to hearing what it is about to ensure it's even relevant?"

### "Please send me an email" (after the pitch)
RESPONSE: "Absolutely."
"What's the best email to reach you on?"
"To ensure it hits the mark, which of the problems I mentioned is the most relevant?"

### "Please send me an email" (during the conversation)
RESPONSE: "Absolutely. I certainly can, but do you mind asking a question first?"
"Nine times out of ten, when someone asks you for an email, what does that actually mean?"

### "I'm not interested" (right away)
RESPONSES:
- "Was my accent/voice that weird?"
- "Did I sound that boring?"
- "I'm not surprised; I'm a complete stranger interrupting your day."

Then: "Would you be mad if I asked one last question?"
"Is that because you hate sales calls, or you simply have absolutely no problems to fix?"

### "I'm not interested" (after the pitch)
Option A: "It sounds like you have already solved [problem]."
"Do you mind if I ask you how you did it?"

Option B: "When you say not interested, is that because you don't experience the issues I mentioned, or you do, but it's not a priority to fix or some other reason?"

Option C: "When you say not interested, is that because you don't resonate with these issues, you don't enjoy speaking to salespeople, or my pitch was so bad you wanted to hang up halfway through?"

### "Call me back in six months."
Option A: "It sounds like something specific will happen in six months."
"Do you mind me asking what that may be?"

Option B: "Happy to — out of interest, what's likely to have changed in 6 months, or is this a polite way of saying go away?"

### "I'll call you back next week."
RESPONSE: "Ahhh, the famous last words."
[Pause]
"What does it mean 95 times out of 100 when someone says that on a sales call?"

### "I'm in a meeting / I'm busy."
RESPONSE: "Ouch, my timing is awful."
"Would it be a stupid idea to briefly explain now so that you'll never hear from me again if it's irrelevant?"

### "Where did you get my number?"
RESPONSES:
- "If I told you I Googled 'most competent (ICP) in (location)', and your number just came up, would you believe me?"
- "I use a platform called (insert) and you came up as (job title) at (company), is that correct?"`,
    source_file: 'coldcallingwiki.com/docs/objections-wiki',
  },
  {
    section_title: 'Objection Handling - Other Objections',
    content: `## OTHER OBJECTIONS

### "How much research have you done?"
RESPONSE: "That's a fair question. I've done some background research, but obviously, I don't have your deep knowledge. That's why I called."
"In fact, [question]?"

### "I need to discuss this with someone else."
RESPONSE: "That makes sense; I thought it would be the case."
"Do you mind if I ask an obvious question?"
"What do you think they'll say when you discuss this with them?"

### "We tried that, but it didn't work for us."
RESPONSE: "Oh, I don't hear that often."
"When you say it didn't work for you, what exactly do you mean by that?"

## THE "ONE LAST QUESTION" TECHNIQUE

You tried to deal with the objection, but the prospect still wants to end the call.

You have one card to play: the last question.

"Before I go, do you mind if I ask one last question?"

95/100 times, they'll agree.

You then want to ask a great question to get back in. You know you've done well when they say: "good question."

Examples:
- "If you had to fix a problem in (your product/service area), what's the first one that comes to mind?"
- "Do you genuinely not have any of these problems, or don't trust a cold caller could help?"
- "What would have to change for you to consider (solution)?"

The BEST Last Questions come from active listening.

Example:
Prospect: "I never had this problem."
You: "How would you deal with it if you had to?"

The aim is always the same – getting the prospect to think more deeply about the problem.`,
    source_file: 'coldcallingwiki.com/docs/objections-wiki',
  },

  // ============ CALL STRUCTURE ============
  {
    section_title: 'Cold Call Structure - Complete Framework',
    content: `## WHY HAVE A STRUCTURE?

Cold calls scare many because they are not predictable.

A structure is what helps you to make them predictable.

Every conversation will go differently, of course.

A clear framework will help you keep on track and not lose opportunities.

The structure proposed is based on human psychology, making it reliable.

## THE 9-STEP COLD CALL STRUCTURE

### 1. OPENER
"I'll be upfront, this is a cold call. Do you want to throw your phone out of the window or let me have 30 seconds?"
WHY: Grab attention and set the tone.

### 2. THE PITCH
"We're usually invited in by open-minded [ICP] looking to fix on these issues:
• [Pain 1] Broad
• [Specific Pain 2]
• [Specific Pain 3]
I have a feeling you'll tell me you don't have these problems, and [situation you help fix] is already perfect."
WHY: Present 1-3 problems you or your company fix. Problems resonate 2x as strongly as benefits.

### 3. PROBLEM
"Out of the earlier mentioned issues, which would you prefer to cancel off the face of the Earth?"
WHY: Keep returning to the problems; if you don't have problems, you won't get a deal.

### 4. EXAMPLE
"Help me understand. Could you give me an example of this in your world?"
WHY: Giving an example will make the problem real. They won't sit in a meeting if they can't even think of an example.

### 5. IMPACT
"Could you tell me more of what this actually means for you?"
WHY: Don't use the word "impact" (too salesy). You still need to understand what the effect is.

### 6. ROOT CAUSE
"How long has it been that way?"
"And how long has this been the case?"
"Where do you think it comes from?"
WHY: If you can understand where the problem comes from, you can figure out if they will do something about it.

### 7. SUMMARY
"Let me see if I got this right, you told me: a, b, c, etc. Did I miss anything?"
"Can I ask you a direct question? Have you given up on trying to fix this?"
WHY: This is the part where you make them feel heard and confirm this is all real. The "given up" question gets them more emotional and is the final test.

### 8. CLOSING
"From what you told me, I'm not yet 100% sure we could help. Would it be a bad idea to sit down and explore this to see what can be done?"
WHY: A low commitment, negatively framed question. Do NOT mention the word "meeting" or "calendar" – it will trigger resistance.

### 9. SECURE CLOSE
"Do you mind if I ask one last question? Is there any reason come Tuesday at 3 pm I may be left crying into my coffee because you haven't shown up?"
WHY: You started with a lower level of commitment; now you can double down.

NOTE: Once you have the example (Step 4), the problem is real. If you feel the prospect will run out of time or your solution is very simple, you can try to close here.`,
    source_file: 'coldcallingwiki.com/docs/call-structure',
  },

  // ============ PSYCHOLOGY ============
  {
    section_title: 'Sales Psychology - Key Principles',
    content: `## KEY PSYCHOLOGICAL PRINCIPLES FOR COLD CALLING

### REACTANCE
When you push, people resist. Give freedom, and they open up.
APPLICATION: Use permission-based language. "Would you be opposed to..." instead of "Let me tell you about..."

### LOSS AVERSION / RISK AVERSION
Humans are 2x more likely to act to avoid a loss than to gain a benefit.
APPLICATION: Focus your pitch on PROBLEMS, not benefits. "What would happen if this problem continued?" rather than "Imagine how great it would be..."

### NEGATIVE BIAS
Humans are wired to pay more attention to negative information than positive.
APPLICATION: Frame questions negatively. "Would it be a bad idea to..." works better than "Would you like to..."

### RECIPROCITY
When you give something, people feel compelled to give back.
APPLICATION: Give prospects an easy way out. When you're generous with their time, they'll be generous with their attention.

### AVAILABILITY BIAS
People judge likelihood based on how easily examples come to mind.
APPLICATION: Get specific examples from prospects to make problems feel real and recent.

## EMOTIONAL TRIGGERS

Most of selling is done around these three emotional triggers:
1. Money
2. Time
3. Risk

If prospects don't get emotional, they won't care.

### TECHNIQUES TO MAKE PROSPECTS EMOTIONAL:

**Scale the problem:**
"On a scale from 1 to 10, 1 being it's little more than an ant in the garden, and 10 is a ticking bomb, where would you rate yourself?"
If 8/9/10: "Sorry, I think I missed that, what did you say?" or "9??? No one ever says 9"

**Challenge them:**
"How do I say something really direct without offending you? It sounds like it may be your fault."

**The Old Faithful:**
"Can I ask you a very blunt question? Have you given up on this?"

**Looking positively at the future:**
"What would you like to see as a positive change if we worked together for three months?"
"What's so good about that? / Why is that good?"`,
    source_file: 'coldcallingwiki.com/docs/psychological-principles',
  },

  // ============ CLOSING ============
  {
    section_title: 'Closing Techniques',
    content: `## CLOSING THE COLD CALL

### THE LOW-COMMITMENT CLOSE
"From what you told me, I'm not yet 100% sure we could help. Would it be a bad idea to sit down and explore this to see what can be done?"

WHY IT WORKS:
- Low commitment (not asking for a "meeting")
- Negatively framed ("Would it be a bad idea")
- You're not sure either (reduces pressure)
- Do NOT say "meeting" or "calendar" - these words trigger resistance

### THE SECURE CLOSE
After they agree to meet:
"Do you mind if I ask one last question? Is there any reason come Tuesday at 3 pm I may be left crying into my coffee because you haven't shown up?"

WHY IT WORKS:
- Humour reduces tension
- Gets commitment confirmed
- Surfaces any hidden objections
- You started with low commitment, now you can double down

### EMOTIONAL SUMMARY BEFORE CLOSING
"Let me see if I got this right, you told me:
- [Problem 1]
- [Impact of problem 1]
- [Problem 2]
- [Impact of problem 2]
Did I miss anything?"

Then: "Can I ask you a direct question? Have you given up on trying to fix this?"

This gets them emotional and confirms the problems are real before you ask for the meeting.`,
    source_file: 'coldcallingwiki.com/docs/closing',
  },

  // ============ GATEKEEPER ============
  {
    section_title: 'Getting Past the Gatekeeper',
    content: `## HOW TO GET PAST THE GATEKEEPER

### SCRIPT 1 - Ask for Help
"Hi Mark, I was hoping you could help me. I am Giulio, and I need to speak with {prospect's name}. Can you put me through?"

WHY: Asking for help is disarming. Most people want to be helpful.

### SCRIPT 2 - Familiarity
"Hi, it's Giulio for {prospect's name}, please."

WHY: Speaking as if you know them reduces suspicion. Keep it casual and confident.

### SCRIPT 3 - Vague but Important
"Hi, I'm following up on something with {prospect's name}. Can you connect me?"

WHY: Vague enough to not sound like a cold call, specific enough to sound legitimate.

### IF THEY ASK WHAT IT'S ABOUT:
- "It's regarding their [department] challenges - they'll know what it's about."
- "I'm calling about [broad topic related to their role]. Is now a good time to connect me?"
- "I reached out last week about [pain point] - just following up."

### KEY PRINCIPLES:
1. Be confident - hesitation signals you're a cold caller
2. Be brief - long explanations sound like sales pitches
3. Be friendly but not overly so - gatekeepers can smell fake friendliness
4. Treat them with respect - they're doing their job
5. If blocked, ask when would be a better time or if there's someone else who handles this`,
    source_file: 'coldcallingwiki.com/docs/dealing-with-the-gatekeeper',
  },
]

async function main() {
  console.log('🗑️  Deleting ALL existing wiki entries...')

  // Delete ALL existing wiki/methodology content
  const { error: deleteError } = await supabase
    .from('knowledge_base')
    .delete()
    .or('source_file.ilike.%wiki%,source_file.ilike.%methodology%,source_file.ilike.%coldcall%')

  if (deleteError) {
    console.error('Delete error:', deleteError)
  } else {
    console.log('✅ Old content deleted')
  }

  console.log(`\n📥 Inserting ${wikiContent.length} entries from coldcallingwiki.com...\n`)

  for (const entry of wikiContent) {
    try {
      console.log(`  Processing: ${entry.section_title}`)

      // Generate embedding
      const text = `${entry.section_title}\n\n${entry.content}`
      const embedding = await generateEmbedding(text)

      // Insert with embedding
      const { error: insertError } = await supabase
        .from('knowledge_base')
        .insert({
          section_title: entry.section_title,
          content: entry.content,
          source_file: entry.source_file,
          source: 'wiki',
          embedding,
        })

      if (insertError) {
        console.error(`  ❌ Error: ${entry.section_title}`, insertError.message)
      } else {
        console.log(`  ✅ Inserted: ${entry.section_title}`)
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error(`  ❌ Error processing: ${entry.section_title}`, err)
    }
  }

  console.log('\n✅ Knowledge base populated with canonical coldcallingwiki.com content!')
  console.log('\n📊 Summary:')
  console.log(`   - ${wikiContent.length} entries added`)
  console.log('   - All entries have embeddings')
  console.log('   - Source: coldcallingwiki.com')
}

main().catch(console.error)
