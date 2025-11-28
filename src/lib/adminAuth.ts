// Simple admin authentication utility

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'GET',
      credentials: 'include'
    })
    const data = await response.json()
    return data.authenticated === true
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

