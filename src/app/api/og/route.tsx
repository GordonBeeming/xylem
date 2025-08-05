import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // Check for blog post specific params
  const hasTitle = searchParams.has('title')
  const title = hasTitle ? searchParams.get('title')?.slice(0, 100) : 'Gordon Beeming'
  const publishDate = searchParams.get('publishDate')
  const tagsString = searchParams.get('tags')
  const tags = tagsString ? tagsString.split(',').slice(0, 3) : []

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
          padding: '60px',
        }}
      >
        {/* Section 1: Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ fontSize: 32, color: '#57606a' }}>Xylem</div>
          <img
            // @ts-ignore
            src={logoData}
            width="100"
            height="100"
            alt="Logo"
          />
        </div>

        {/* Section 2: Main Content (Title and Metadata) */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', alignItems: hasTitle ? 'flex-start' : 'center', width: '100%' }}>
          <div style={{ fontSize: hasTitle ? 68 : 80, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, textAlign: hasTitle ? 'left' : 'center', maxWidth: '90%' }}>
            {title}
          </div>
          {!hasTitle && (
            <div style={{ marginTop: '25px', fontSize: 32, color: '#57606a', lineHeight: 1.3, textAlign: 'center', maxWidth: '80%' }}>
              {tagline}
            </div>
          )}
          {hasTitle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '30px', fontSize: 28, color: '#57606a' }}>
              <span>{publishDate}</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ backgroundColor: '#E9ECEF', color: '#1A1A1A', padding: '8px 16px', borderRadius: '9999px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '2px solid #E9ECEF', paddingTop: '20px' }}>
          <div style={{ fontSize: 28, color: '#57606a' }}>
            gordonbeeming.com
          </div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#003353' }}>
            Gordon Beeming
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{
        name: 'Inter',
        data: fontData,
        weight: 700,
        style: 'normal',
      }],
    }
  );
}