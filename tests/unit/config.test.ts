import { describe, it, expect } from 'vitest'
import { PERSONAS, getPersonaById, getPersonaPrompt, getAllPersonas } from '@/config/personas'
import { CURRICULUM_MODULES, getModuleById, getModulesByTopic, getAllModules } from '@/config/curriculum'
import { SCORING_RUBRIC, getRubricByDimension, getDimensionWeight } from '@/config/rubric'

describe('Personas Configuration', () => {
  describe('PERSONAS', () => {
    it('should have all required personas', () => {
      const requiredPersonas = [
        'skeptical_cfo',
        'busy_vp_sales',
        'friendly_gatekeeper',
        'defensive_manager',
        'interested_but_stuck',
        'aggressive_closer',
      ]

      for (const id of requiredPersonas) {
        expect(PERSONAS[id]).toBeDefined()
        expect(PERSONAS[id].name).toBeTruthy()
        expect(PERSONAS[id].role).toBeTruthy()
        expect(PERSONAS[id].personality).toBeTruthy()
        expect(PERSONAS[id].objections).toBeInstanceOf(Array)
        expect(PERSONAS[id].warmth).toBeGreaterThanOrEqual(0)
        expect(PERSONAS[id].warmth).toBeLessThanOrEqual(1)
        expect(PERSONAS[id].voiceId).toBeTruthy()
      }
    })

    it('should have valid warmth values', () => {
      for (const persona of Object.values(PERSONAS)) {
        expect(persona.warmth).toBeGreaterThanOrEqual(0)
        expect(persona.warmth).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('getPersonaById', () => {
    it('should return persona by id', () => {
      const persona = getPersonaById('skeptical_cfo')
      expect(persona).toBeDefined()
      expect(persona?.name).toBe('Sarah Chen')
    })

    it('should return undefined for unknown id', () => {
      const persona = getPersonaById('nonexistent')
      expect(persona).toBeUndefined()
    })
  })

  describe('getPersonaPrompt', () => {
    it('should return persona prompt', () => {
      const prompt = getPersonaPrompt('skeptical_cfo')
      expect(prompt).toBeTruthy()
      expect(prompt).toContain('Sarah Chen')
      expect(prompt).toContain('CFO')
    })

    it('should return empty string for unknown id', () => {
      const prompt = getPersonaPrompt('nonexistent')
      expect(prompt).toBe('')
    })
  })

  describe('getAllPersonas', () => {
    it('should return all personas as array', () => {
      const personas = getAllPersonas()
      expect(personas).toBeInstanceOf(Array)
      expect(personas.length).toBe(6)
    })
  })
})

describe('Curriculum Configuration', () => {
  describe('CURRICULUM_MODULES', () => {
    it('should have 12 modules', () => {
      expect(CURRICULUM_MODULES.length).toBe(12)
    })

    it('should have sequential ids from 1 to 12', () => {
      for (let i = 0; i < 12; i++) {
        expect(CURRICULUM_MODULES[i].id).toBe(i + 1)
      }
    })

    it('should have required fields', () => {
      for (const module of CURRICULUM_MODULES) {
        expect(module.id).toBeGreaterThan(0)
        expect(module.name).toBeTruthy()
        expect(module.description).toBeTruthy()
        expect(module.topics).toBeInstanceOf(Array)
        expect(module.topics.length).toBeGreaterThan(0)
        expect(module.content).toBeTruthy()
      }
    })

    it('should cover key topics', () => {
      const allTopics = CURRICULUM_MODULES.flatMap((m) => m.topics)
      const requiredTopics = ['flow', 'permission_based', 'problems_over_benefits', 'framework', 'negative_frame']

      for (const topic of requiredTopics) {
        expect(allTopics).toContain(topic)
      }
    })
  })

  describe('getModuleById', () => {
    it('should return module by id', () => {
      const module = getModuleById(1)
      expect(module).toBeDefined()
      expect(module?.name).toBe('Call Structure')
    })

    it('should return undefined for unknown id', () => {
      const module = getModuleById(99)
      expect(module).toBeUndefined()
    })
  })

  describe('getModulesByTopic', () => {
    it('should return modules containing topic', () => {
      const modules = getModulesByTopic('framework')
      expect(modules.length).toBeGreaterThan(0)
      for (const module of modules) {
        expect(module.topics).toContain('framework')
      }
    })

    it('should return empty array for unknown topic', () => {
      const modules = getModulesByTopic('nonexistent_topic')
      expect(modules).toEqual([])
    })
  })

  describe('getAllModules', () => {
    it('should return all modules', () => {
      const modules = getAllModules()
      expect(modules.length).toBe(12)
    })
  })
})

describe('Scoring Rubric Configuration', () => {
  describe('SCORING_RUBRIC', () => {
    it('should have 6 dimensions', () => {
      expect(SCORING_RUBRIC.length).toBe(6)
    })

    it('should have weights summing to approximately 1', () => {
      const totalWeight = SCORING_RUBRIC.reduce((sum, r) => sum + r.weight, 0)
      expect(totalWeight).toBeCloseTo(1, 2)
    })

    it('should have required dimensions', () => {
      const dimensions = SCORING_RUBRIC.map((r) => r.dimension)
      expect(dimensions).toContain('opener')
      expect(dimensions).toContain('pitch')
      expect(dimensions).toContain('discovery')
      expect(dimensions).toContain('objection_handling')
      expect(dimensions).toContain('closing')
      expect(dimensions).toContain('communication')
    })

    it('should have criteria for each dimension', () => {
      for (const rubric of SCORING_RUBRIC) {
        expect(rubric.criteria.length).toBeGreaterThan(0)
        for (const criterion of rubric.criteria) {
          expect(criterion.name).toBeTruthy()
          expect(criterion.description).toBeTruthy()
          expect(criterion.weight).toBeGreaterThan(0)
        }
      }
    })

    it('should have criteria weights summing to 1 per dimension', () => {
      for (const rubric of SCORING_RUBRIC) {
        const totalCriteriaWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0)
        expect(totalCriteriaWeight).toBeCloseTo(1, 2)
      }
    })
  })

  describe('getRubricByDimension', () => {
    it('should return rubric by dimension', () => {
      const rubric = getRubricByDimension('opener')
      expect(rubric).toBeDefined()
      expect(rubric?.dimension).toBe('opener')
    })

    it('should return undefined for unknown dimension', () => {
      const rubric = getRubricByDimension('nonexistent' as Parameters<typeof getRubricByDimension>[0])
      expect(rubric).toBeUndefined()
    })
  })

  describe('getDimensionWeight', () => {
    it('should return correct weight', () => {
      const weight = getDimensionWeight('discovery')
      expect(weight).toBe(0.25)
    })

    it('should return 0 for unknown dimension', () => {
      const weight = getDimensionWeight('nonexistent' as Parameters<typeof getDimensionWeight>[0])
      expect(weight).toBe(0)
    })
  })
})
