import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  let fontData: ArrayBuffer;
  try {
    const fontResponse = await fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff'
    );
    fontData = await fontResponse.arrayBuffer();
  } catch {
    fontData = new ArrayBuffer(0);
  }

  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Gordon Beeming';
  const readingTime = searchParams.get('readingTime') || '';
  const tags = searchParams.get('tags') || '';
  const tagList = tags ? tags.split(',').slice(0, 4) : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0063B2 0%, #004E8C 50%, #003A6B 100%)',
          fontFamily: fontData.byteLength > 0 ? 'Inter' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: title.length > 60 ? 40 : 52,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          {readingTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  fontSize: 20,
                  color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                }}
              >
                {readingTime}
              </div>
            </div>
          )}
          {tagList.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {tagList.map((tag) => (
                <div
                  key={tag}
                  style={{
                    fontSize: 16,
                    color: '#46CBFF',
                    background: 'rgba(70,203,255,0.15)',
                    padding: '4px 14px',
                    borderRadius: '16px',
                    textTransform: 'uppercase',
                  }}
                >
                  {tag.trim()}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '80px',
            fontSize: 22,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          gordonbeeming.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fontData.byteLength > 0
        ? { fonts: [{ name: 'Inter', data: fontData, weight: 700 as const, style: 'normal' as const }] }
        : {}),
    }
  );
}
