import { api } from './client'

export const reportsApi = {
  list: (filters = {}) => api.get('/reports.php', { action: 'list', ...filters }),
  get: (id) => api.get('/reports.php', { action: 'get', id }),
  create: (formData) => api.upload('/reports.php?action=create', formData),
  update: (id, data) => api.put('/reports.php?action=update', { id, ...data }),
  updateWithImages: (id, data, files = []) => {
    const formData = new FormData()
    formData.append('_method', 'PUT')
    Object.entries({ id, ...data }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value)
    })
    files.slice(0, 5).forEach((file) => formData.append('images[]', file))
    return api.upload('/reports.php?action=update', formData)
  },
  updateStatus: (id, status) => api.put('/reports.php?action=update_status', { id, status }),
  assignAgency: (id, agency_id) => api.put('/reports.php?action=assign_agency', { id, agency_id }),
  addComment: (id, comment) => api.post('/reports.php?action=add_comment', { id, comment }),
  remove: (id) => api.del('/reports.php?action=delete', { id }),
  trend: (range = 'week') => api.get('/stats.php', { action: 'trend', range }),
}
