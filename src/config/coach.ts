// Giulio Segantini - Main Sales Coach Configuration

export const GIULIO_COACH = {
  id: 'giulio_coach',
  name: 'Giulio Segantini',
  role: 'Sales Coach',
  title: 'The Weirdest Sales Trainer',
  retellAgentId: 'agent_93437dbb48f6257ba8f72cde68',
  description: 'Master cold calling with the Underdog methodology. 12-module curriculum, objection handling, and real-time coaching.',
}

export type CoachingMode = 'curriculum' | 'objections' | 'techniques' | 'free'

export const COACHING_MODES: { id: CoachingMode; label: string; description: string }[] = [
  {
    id: 'curriculum',
    label: 'Learn Curriculum',
    description: 'Work through the 12 modules',
  },
  {
    id: 'objections',
    label: 'Objection Practice',
    description: 'Handle the 17 toughest objections',
  },
  {
    id: 'techniques',
    label: 'Technique Coaching',
    description: 'Openers, pitch, discovery, closing',
  },
  {
    id: 'free',
    label: 'Free Coaching',
    description: 'Ask me anything about sales',
  },
]
