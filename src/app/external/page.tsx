import { Metadata } from 'next'

interface ExternalPageProps {
  searchParams: Promise<{ link?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'External Link',
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
      <>
        <style>{darkModeCSS}</style>
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>External Link</h1>
            <p style={styles.message}>
              No external link was provided. This page is used to safely redirect to external websites.
            </p>
            <div style={styles.buttonContainer}>
              <a href="/" style={styles.homeButton}>
                Go Home
              </a>
            </div>
          </div>
        </div>
      </>
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
        <>
          <style>{darkModeCSS}</style>
          <div style={styles.container}>
            <div style={styles.card}>
              <h1 style={styles.title}>Invalid Link</h1>
              <p style={styles.message}>
                The provided link is not valid or cannot be decoded. Please check the URL and try again.
              </p>
              <p style={styles.providedLink}>
                Provided: <code style={styles.code}>{linkParam}</code>
              </p>
              <div style={styles.buttonContainer}>
                <a href="/" style={styles.homeButton}>
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </>
      )
    }
  }

  const hostname = getHostname(finalUrl)

  return (
    <>
      <style>{darkModeCSS}</style>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>External Link Notice</h1>
          <p style={styles.message}>
            You previously used to be redirected through this page, but we no longer automatically redirect to external sites.
          </p>
          <div style={styles.linkInfo}>
            <p style={styles.destinationLabel}>Destination:</p>
            <p style={styles.destinationUrl}>{finalUrl}</p>
            <p style={styles.destinationHost}>Host: {hostname}</p>
          </div>
          <div style={styles.buttonContainer}>
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              style={styles.continueButton}
            >
              Continue to External Site
            </a>
            <a href="/" style={styles.homeButton}>
              Go Home
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

// CSS for dark mode support
const darkModeCSS = `
  :root {
    --color-gray-50: #f8f9fa;
    --color-gray-100: #f3f4f6;
    --color-gray-200: #e0e0e0;
    --color-gray-300: #d1d5db;
    --color-gray-600: #6b7280;
    --color-gray-700: #374151;
    --color-gray-900: #1a1a1a;
    --color-white: #ffffff;
    --color-primary-600: #2563eb;
    --color-primary-700: #1e40af;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-gray-50: #1f2937;
      --color-gray-100: #374151;
      --color-gray-200: #4b5563;
      --color-gray-300: #6b7280;
      --color-gray-600: #9ca3af;
      --color-gray-700: #d1d5db;
      --color-gray-900: #f9fafb;
      --color-white: #111827;
      --color-primary-600: #3b82f6;
      --color-primary-700: #60a5fa;
    }
  }

  .dark {
    --color-gray-50: #1f2937;
    --color-gray-100: #374151;
    --color-gray-200: #4b5563;
    --color-gray-300: #6b7280;
    --color-gray-600: #9ca3af;
    --color-gray-700: #d1d5db;
    --color-gray-900: #f9fafb;
    --color-white: #111827;
    --color-primary-600: #3b82f6;
    --color-primary-700: #60a5fa;
  }
`

// Inline styles with CSS custom properties for light/dark mode support
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'var(--color-gray-50)',
    color: 'var(--color-gray-900)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'var(--color-white)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: '8px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: 'var(--color-gray-900)',
    margin: '0 0 1rem 0',
  } as React.CSSProperties,
  message: {
    marginBottom: '1.5rem',
    lineHeight: '1.5',
    color: 'var(--color-gray-700)',
    margin: '0 0 1.5rem 0',
  } as React.CSSProperties,
  linkInfo: {
    backgroundColor: 'var(--color-gray-50)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  destinationLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--color-gray-600)',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0',
  } as React.CSSProperties,
  destinationUrl: {
    wordBreak: 'break-all' as const,
    marginBottom: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'var(--color-primary-700)',
    margin: '0 0 0.5rem 0',
  } as React.CSSProperties,
  destinationHost: {
    fontSize: '0.875rem',
    color: 'var(--color-gray-600)',
    margin: '0',
  } as React.CSSProperties,
  providedLink: {
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-gray-600)',
    margin: '0 0 1.5rem 0',
  } as React.CSSProperties,
  code: {
    backgroundColor: 'var(--color-gray-100)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  } as React.CSSProperties,
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  continueButton: {
    backgroundColor: 'var(--color-primary-600)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'inline-block',
  } as React.CSSProperties,
  homeButton: {
    backgroundColor: 'var(--color-gray-100)',
    color: 'var(--color-gray-700)',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
    border: '1px solid var(--color-gray-300)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'inline-block',
  } as React.CSSProperties,
}