const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
const productionUrl =
  configuredUrl === 'https://mosotea.co.nz'
    ? 'https://www.mosotea.co.nz'
    : configuredUrl

export const SITE_URL =
  productionUrl && !productionUrl.includes('localhost')
    ? productionUrl
    : 'https://www.mosotea.co.nz'

export const SITE_NAME = 'Moso Tea'

export function canonicalPath(path = '/') {
  return path === '/' ? '/' : path.replace(/\/$/, '')
}
