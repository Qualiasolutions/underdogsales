// Giulio Segantini - Main Sales Coach Configuration

export const GIULIO_COACH = {
  id: 'giulio_coach',
  name: 'Giulio Segantini',
  role: 'Sales Coach',
  title: 'The Weirdest Sales Trainer',
  retellAgentId: 'agent_645c98e3a4ab29e00891834ea9',
  description: 'Master cold calling with the Underdog methodology. 12-module curriculum, objection handling, and real-time coaching.',
  image: '/coach.png',
}

export type CoachingMode = 'pitch' | 'objections' | 'general' | 'research'

export const COACHING_MODES: { id: CoachingMode; label: string; description: string }[] = [
  {
    id: 'pitch',
    label: 'Pitch Builder',
    description: 'Craft your perfect cold call pitch',
  },
  {
    id: 'objections',
    label: 'Objections',
    description: 'Handle the toughest objections',
  },
  {
    id: 'research',
    label: 'Prospect Research',
    description: 'Research companies before calls',
  },
  {
    id: 'general',
    label: 'General Chat',
    description: 'Ask me anything about sales',
  },
]
