import { Metadata } from 'next'

interface ExternalPageProps {
  searchParams: Promise<{ link?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "You're leaving gordonbeeming.com",
    description: 'You are being redirected to an external website.',
    robots: {
      index: false,
      follow: true,
    },
    referrer: 'no-referrer',
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

function decodeBase64Url(encodedUrl: string): string | null {
  try {
    return atob(encodedUrl)
  } catch {
    return null
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'unknown'
  }
}

export default async function ExternalPage({ searchParams }: ExternalPageProps) {
  const params = await searchParams
  const linkParam = params.link

  if (!linkParam) {
    return (
      <div className="mx-auto max-w-3xl px-6 sm:px-8 xl:max-w-5xl xl:px-0">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 max-w-2xl w-full shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              You're leaving gordonbeeming.com
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              No link was provided.
            </p>
            <div className="flex gap-3">
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Try to decode the URL directly first, then try base64 decoding as fallback
  let finalUrl = linkParam
  if (!isValidUrl(linkParam)) {
    const decodedUrl = decodeBase64Url(linkParam)
    if (decodedUrl && isValidUrl(decodedUrl)) {
      finalUrl = decodedUrl
    } else {
      return (
        <div className="mx-auto max-w-3xl px-6 sm:px-8 xl:max-w-5xl xl:px-0">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 max-w-2xl w-full shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                You're leaving gordonbeeming.com
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Invalid or unsupported link.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Provided: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">{linkParam}</code>
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Go home
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  const hostname = getHostname(finalUrl)

  return (
    <div className="mx-auto max-w-3xl px-6 sm:px-8 xl:max-w-5xl xl:px-0">
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 max-w-2xl w-full shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            You're leaving gordonbeeming.com
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            This link opens an external site ({hostname}). Please review the destination and only continue if you trust it. External sites may have different privacy or security practices.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-6 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Destination
              </p>
              <p className="text-sm font-mono text-primary-700 dark:text-primary-400 break-all">
                {finalUrl}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Host
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {hostname}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-800 dark:bg-primary-400 dark:text-gray-900 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Continue to external site
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

