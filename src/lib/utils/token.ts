export function isTokenExpired(expiresAt: number | null): boolean {
    if (!expiresAt) return false // GitHub tokens don't expire
    const now = Math.floor(Date.now() / 1000)
    const buffer = 5 * 60 // 5 minutes buffer
    return now >= expiresAt - buffer
}
