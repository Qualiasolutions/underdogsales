-- Seed data for Underdog AI Sales Coach
-- Objection Library based on Underdog methodology

INSERT INTO objection_library (category, objection_text, response_template, psychology_principle) VALUES

-- PRICING OBJECTIONS
('pricing', 'We don''t have any budget.',
 'It must be frustrating to operate with no money. [Pause] I''m assuming even if you had budget, this wouldn''t be a priority anyway, right?',
 'Negative framing - gets them to defend their interest'),

('pricing', 'It''s too expensive.',
 'Oh I don''t get that a lot. Do you mind if I ask a stupid question? Does that mean you''re currently perfectly satisfied for a much cheaper price?',
 'Reframe to value, not price'),

('pricing', 'We need to see ROI before investing.',
 'That makes sense. What would successful ROI look like in your world? What metrics matter most?',
 'Shift from objection to discovery'),

-- STATUS QUO OBJECTIONS
('status_quo', 'We''re fine/good, thanks.',
 'Is that because you genuinely don''t have problem X, or you don''t trust someone cold calling you could help?',
 'Challenge the comfort zone gently'),

('status_quo', 'We already have a supplier/something in place.',
 'I thought you would, at least you are relevant for our offer. Does that mean everything is perfect? What are they doing so well that deserves your loyalty?',
 'Validate then probe for cracks'),

('status_quo', 'No.',
 'Good. So, that means you can consider an alternative supplier if you believe it''s better, without any guilt?',
 'Use their no to open a door'),

('status_quo', 'We don''t need this at the moment.',
 'That''s not surprising; I thought you may have already fixed the problem; would you be opposed to sharing how?',
 'Curiosity and learning frame'),

('status_quo', 'It''s not the right time for this.',
 'I do usually have horrible timing. Does that mean you don''t need this at all, or are other priorities completely taking over your schedule?',
 'Self-deprecation plus clarification'),

-- BRUSH OFF OBJECTIONS
('brush_off', 'I don''t take sales/cold calls.',
 'You don''t take any cold calls or just the bad ones?',
 'Light challenge with humor'),

('brush_off', 'Please send me an email.',
 'Of course, I can. What''s the best email to reach you on? Before I do, would you be opposed to hearing what it is about to ensure it''s even relevant?',
 'Agree then pivot'),

('brush_off', 'I''m not interested.',
 'I''m not surprised; I''m a complete stranger interrupting your day. Would you be mad if I asked one last question? Is that because you hate sales calls, or you simply have absolutely no problems to fix?',
 'Acknowledge then probe'),

('brush_off', 'Call me back in six months.',
 'Happy to — out of interest, what''s likely to have changed in 6 months, or is this a polite way of saying go away?',
 'Direct honesty check'),

('brush_off', 'I''m in a meeting / I''m busy.',
 'Ouch, my timing is awful. Would it be a stupid idea to briefly explain now so that you''ll never hear from me again if it''s irrelevant?',
 'Self-deprecation plus time efficiency'),

-- TIMING OBJECTIONS
('timing', 'Now isn''t a good time.',
 'I completely understand. When would be less terrible? Or is there something specific happening that''s eating up your bandwidth?',
 'Empathy plus discovery'),

('timing', 'We''re in the middle of [project/transition].',
 'That sounds intense. How is that going? What''s the biggest challenge with it?',
 'Redirect to their problems'),

('timing', 'Let''s revisit this next quarter.',
 'Sure, I can do that. Help me understand though - what needs to happen between now and then for this to become relevant?',
 'Understand real blockers'),

-- AUTHORITY OBJECTIONS
('authority', 'I''m not the right person for this.',
 'I appreciate you telling me that. Who would typically look after decisions around [problem area]?',
 'Gracious redirect'),

('authority', 'I need to check with my boss/team.',
 'That makes sense. What do you think they''d say? What concerns might they have?',
 'Coach them to sell internally'),

('authority', 'This isn''t my decision to make.',
 'I understand. If you were to recommend something like this, what would need to be true for you to feel comfortable doing so?',
 'Build internal champion'),

('authority', 'We have a procurement process.',
 'I''d expect so. What does that typically look like? How long does it usually take?',
 'Understand the process');

-- Note: Embeddings will be populated separately via API call
-- Run this after seeding:
-- SELECT id, objection_text FROM objection_library WHERE embedding IS NULL;
-- Then use OpenAI embedding API to generate and update embeddings
