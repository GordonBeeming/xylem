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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.15) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          padding: '60px',
        }}
      >
        {/* Header with Logo */}
        <div style={{ display: 'flex', alignSelf: 'flex-start' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#46cbff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1a1a1a',
            }}
          >
            X
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            flex: 1,
            justifyContent: 'center',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: hasTitle ? '52px' : '60px',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#ffffff',
              marginBottom: publishDate ? '20px' : '0',
            }}
          >
            {title}
          </div>
          {publishDate && (
            <div
              style={{
                fontSize: '28px',
                color: '#e0e0e0',
              }}
            >
              {publishDate}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      backgroundColor: '#2c2c2c',
                      color: '#46cbff',
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: '20px',
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#46cbff',
              fontWeight: 'bold',
            }}
          >
            Xylem
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}