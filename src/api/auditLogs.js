import { api, getToken } from './client'
import { API_BASE_URL } from './config'

export const auditLogsApi = {
  list: ({ action: actionType, ...rest } = {}) =>
    api.get('/audit_logs.php', { action: 'list', filter: actionType, ...rest }),
}

// Export links are plain <a href> downloads, so the bearer token can't be
// sent as a header — it's passed as a query param instead (export.php
// accepts both).
export const exportUrl = (type, format = 'csv') =>
  `${API_BASE_URL}/export.php?type=${type}&format=${format}&token=${encodeURIComponent(getToken() || '')}`
