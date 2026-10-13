import { api } from './client'

export const statsApi = {
  dashboard: (range) => api.get('/stats.php', { action: 'dashboard', range }),
  trend: (range) => api.get('/stats.php', { action: 'trend', range }),
  categoryBreakdown: () => api.get('/stats.php', { action: 'category_breakdown' }),
  statusBreakdown: () => api.get('/stats.php', { action: 'status_breakdown' }),
}
