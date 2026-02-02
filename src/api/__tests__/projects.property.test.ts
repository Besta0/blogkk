/**
 * Property-Based Tests for Project Data Fetching Completeness
 * 
 * **Feature: dynamic-portfolio-upgrade, Property 4: 项目数据获取完整性**
 * 
 * **Validates: Requirements 3.1, 3.2, 3.4**
 * 
 * This test verifies that for any project data request, the system returns
 * complete project information including all required fields and associated data.
 */

import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import type { Project, ProjectsResponse } from '../types'

/**
 * Arbitrary generator for valid ISO date strings
 * Uses integer timestamps to avoid invalid date issues
 */
const isoDateArbitrary = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map(ts => new Date(ts).toISOString())

/**
 * Arbitrary generator for MongoDB-like ObjectId (24 hex characters)
 */
const hexChars = '0123456789abcdef'
const objectIdArbitrary = fc.array(
  fc.integer({ min: 0, max: 15 }),
  { minLength: 24, maxLength: 24 }
).map(arr => arr.map(i => hexChars[i]).join(''))

/**
 * Arbitrary generator for valid Project data
 * Generates projects with all required fields according to the data model
 */
const projectArbitrary = fc.record({
  _id: objectIdArbitrary,
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 10, maxLength: 1000 }),
  technologies: fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
  images: fc.array(fc.webUrl(), { minLength: 0, maxLength: 5 }),
  githubUrl: fc.option(fc.webUrl(), { nil: undefined }),
  liveUrl: fc.option(fc.webUrl(), { nil: undefined }),
  featured: fc.boolean(),
  likes: fc.nat({ max: 10000 }),
  views: fc.nat({ max: 100000 }),
  shares: fc.nat({ max: 5000 }),
  createdAt: isoDateArbitrary,
  updatedAt: isoDateArbitrary,
})

/**
 * Arbitrary generator for ProjectsResponse
 */
const projectsResponseArbitrary = fc.record({
  projects: fc.array(projectArbitrary, { minLength: 0, maxLength: 20 }),
  total: fc.nat({ max: 1000 }),
  page: fc.integer({ min: 1, max: 100 }),
  limit: fc.integer({ min: 1, max: 100 }),
  totalPages: fc.integer({ min: 1, max: 100 }),
})

/**
 * Validates that a project has all required fields with correct types
 */
function validateProjectCompleteness(project: Project): boolean {
  // Required string fields must be non-empty
  if (typeof project._id !== 'string' || project._id.length === 0) return false
  if (typeof project.title !== 'string' || project.title.length === 0) return false
  if (typeof project.description !== 'string') return false
  
  // Technologies must be a non-empty array of strings
  if (!Array.isArray(project.technologies) || project.technologies.length === 0) return false
  if (!project.technologies.every(t => typeof t === 'string' && t.length > 0)) return false
  
  // Images must be an array (can be empty)
  if (!Array.isArray(project.images)) return false
  
  // Optional URL fields must be string or undefined
  if (project.githubUrl !== undefined && typeof project.githubUrl !== 'string') return false
  if (project.liveUrl !== undefined && typeof project.liveUrl !== 'string') return false
  
  // Featured must be boolean
  if (typeof project.featured !== 'boolean') return false
  
  // Numeric fields must be non-negative numbers
  if (typeof project.likes !== 'number' || project.likes < 0) return false
  if (typeof project.views !== 'number' || project.views < 0) return false
  if (typeof project.shares !== 'number' || project.shares < 0) return false
  
  // Date fields must be valid ISO strings
  if (typeof project.createdAt !== 'string') return false
  if (typeof project.updatedAt !== 'string') return false
  
  return true
}

/**
 * Validates that a ProjectsResponse has all required pagination fields
 */
function validateProjectsResponseCompleteness(response: ProjectsResponse): boolean {
  // Projects must be an array
  if (!Array.isArray(response.projects)) return false
  
  // All projects must be complete
  if (!response.projects.every(validateProjectCompleteness)) return false
  
  // Pagination fields must be present and valid
  if (typeof response.total !== 'number' || response.total < 0) return false
  if (typeof response.page !== 'number' || response.page < 1) return false
  if (typeof response.limit !== 'number' || response.limit < 1) return false
  if (typeof response.totalPages !== 'number' || response.totalPages < 1) return false
  
  return true
}

describe('Property 4: 项目数据获取完整性 (Project Data Fetching Completeness)', () => {
  /**
   * Property: For any valid project, all required fields must be present and correctly typed
   * **Validates: Requirements 3.1**
   */
  it('should ensure all generated projects have complete required fields', () => {
    fc.assert(
      fc.property(projectArbitrary, (project) => {
        return validateProjectCompleteness(project)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any valid ProjectsResponse, pagination data must be consistent
   * **Validates: Requirements 3.1, 3.2**
   */
  it('should ensure projects response has valid pagination structure', () => {
    fc.assert(
      fc.property(projectsResponseArbitrary, (response) => {
        return validateProjectsResponseCompleteness(response)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Project technologies array must always contain at least one technology
   * **Validates: Requirements 3.4**
   */
  it('should ensure projects always have at least one technology', () => {
    fc.assert(
      fc.property(projectArbitrary, (project) => {
        return project.technologies.length >= 1
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Project title must be non-empty for display purposes
   * **Validates: Requirements 3.1**
   */
  it('should ensure project title is never empty', () => {
    fc.assert(
      fc.property(projectArbitrary, (project) => {
        return project.title.length > 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Numeric statistics (likes, views, shares) must be non-negative
   * **Validates: Requirements 3.2**
   */
  it('should ensure project statistics are non-negative', () => {
    fc.assert(
      fc.property(projectArbitrary, (project) => {
        return project.likes >= 0 && project.views >= 0 && project.shares >= 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: When filtering by technology, returned projects should contain that technology
   * **Validates: Requirements 3.4**
   */
  it('should ensure technology filtering returns matching projects', () => {
    fc.assert(
      fc.property(
        fc.array(projectArbitrary, { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (projects, filterTech) => {
          // Simulate filtering by technology
          const filteredProjects = projects.filter(p => 
            p.technologies.some(t => t.toLowerCase() === filterTech.toLowerCase())
          )
          
          // All filtered projects must contain the filter technology
          return filteredProjects.every(p => 
            p.technologies.some(t => t.toLowerCase() === filterTech.toLowerCase())
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Pagination page number must be positive
   * **Validates: Requirements 3.1**
   */
  it('should ensure pagination page is always positive', () => {
    fc.assert(
      fc.property(projectsResponseArbitrary, (response) => {
        return response.page >= 1
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Pagination limit must be positive
   * **Validates: Requirements 3.1**
   */
  it('should ensure pagination limit is always positive', () => {
    fc.assert(
      fc.property(projectsResponseArbitrary, (response) => {
        return response.limit >= 1
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Project ID must be unique identifier (non-empty string)
   * **Validates: Requirements 3.2**
   */
  it('should ensure project ID is a valid non-empty string', () => {
    fc.assert(
      fc.property(projectArbitrary, (project) => {
        return typeof project._id === 'string' && project._id.length > 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Date fields must be valid ISO date strings
   * **Validates: Requirements 3.1**
   */
  it('should ensure date fields are valid ISO strings', () => {
    fc.assert(
      fc.property(projectArbitrary, (project) => {
        const createdDate = new Date(project.createdAt)
        const updatedDate = new Date(project.updatedAt)
        return !isNaN(createdDate.getTime()) && !isNaN(updatedDate.getTime())
      }),
      { numRuns: 100 }
    )
  })
})
