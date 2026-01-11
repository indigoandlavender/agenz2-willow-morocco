/**
 * TIFORT-CORE Google Sheets Service
 * Export all sheet operations
 */

export * from './client'
export * from './properties'
export * from './infrastructure'

// Re-export commonly used functions
export {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  searchProperties,
  getAlphaOpportunities,
  getDashboardStats,
} from './properties'

export {
  getAllInfrastructure,
  getInfrastructureByCategory,
  addInfrastructurePoint,
  getDefaultInfrastructure,
} from './infrastructure'
