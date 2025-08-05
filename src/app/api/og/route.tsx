import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  // Determine base URL for local dev vs. production
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

  // --- Fetch assets using absolute public URLs ---
  const fontPromise = fetch(`${baseUrl}/fonts/inter-v19-latin-700.ttf`).then((res) =>
    res.arrayBuffer()
  )
  const logoPromise = fetch(`${baseUrl}/static/images/logo.png`).then((res) =>
    res.arrayBuffer()
  )

  // Await all promises simultaneously
  const [fontData, logoData] = await Promise.all([fontPromise, logoPromise])

  const { searchParams } = new URL(req.url)

  const hasTitle = searchParams.has('title')
  const titleParam = searchParams.get('title')?.slice(0, 100) || 'Gordon Beeming'
  const publishDate = searchParams.get('publishDate')
  const tagsString = searchParams.get('tags')
  const tags = tagsString
    ? tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length <= 15)
      .slice(0, 5)
    : []
  const tagline = 'Father • Husband • Triathlete • SSW Solution Architect'

  // --- Dynamic Font Size and Truncation Logic ---
  let title = titleParam
  let titleFontSize = 80

  if (hasTitle) {
    const length = title.length
    if (length > 75) {
      titleFontSize = 48
    } else if (length > 50) {
      titleFontSize = 56
    } else {
      titleFontSize = 68
    }

    if (length > 95) {
      title = title.slice(0, 92) + '…'
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F6F8FA',
          fontFamily: '"Inter"',
        }}
      >
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '60px' }}>
          {/* Header */}
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}
          >
            <div style={{ fontSize: 32, color: '#57606a' }}>Xylem</div>
            <img
              // @ts-ignore
              src={logoData}
              width="100"
              height="100"
              alt="Logo"
            />
          </div>
          {/* Title Block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Date positioned above the title */}
            {hasTitle && (
              <div style={{ fontSize: 32, color: '#57606a', marginBottom: '20px' }}>{publishDate}</div>
            )}
            {/* Title */}
            <div
              style={{
                fontSize: titleFontSize,
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1.2,
                padding: '0 30px',
              }}
            >
              {title}
            </div>
          </div>
        </div>

        {/* --- FOOTER BAR WITH OVERLAPPING LAYOUT --- */}
        <div
          style={{
            width: '100%',
            height: '160px', // A fixed height for the footer area
            backgroundColor: '#003353',
            color: '#FFFFFF',
            display: 'flex',
            position: 'relative', // Parent for absolute positioning
          }}
        >
          {/* Domain: Absolute bottom-left */}
          <div style={{ position: 'absolute', bottom: 40, left: 60, fontSize: 28, color: '#E0E0E0' }}>
            gordonbeeming.com
          </div>

          {/* Tags: Absolute, positioned above the domain */}
          {hasTitle && (
            <div
              style={{
                position: 'absolute',
                bottom: 85, // Positioned above the domain text
                left: 60,
                right: 420, // Leaves space on the right for the name/tagline
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap', // Force single line
                overflow: 'hidden', // Hide tags that overflow
                gap: '12px',
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#46CBFF',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: 24,
                    flexShrink: 0, // Prevent tags from shrinking
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Right side: Name and Tagline, absolute bottom-right */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>
              Gordon Beeming
            </div>
            <div style={{ marginTop: '8px', fontSize: 22, color: '#E0E0E0' }}>
              {tagline}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )
}