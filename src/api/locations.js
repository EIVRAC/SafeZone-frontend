import { api } from './client'

export const locationsApi = {
  list: () => api.get('/locations.php', { action: 'list' }),
  create: (data) => api.post('/locations.php?action=create', data),
  update: (id, data) => api.put('/locations.php?action=update', { id, ...data }),
  remove: (id) => api.del('/locations.php?action=delete', { id }),
}
