import { allAuthors } from 'contentlayer/generated'

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default')

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#222', color: 'white', minHeight: '100vh' }}>
      <h1>About Page Debug Mode</h1>
      <hr />

      <h2>1. Was the author object found at runtime?</h2>
      <p style={{ color: author ? '#00ff00' : '#ff0000', fontSize: '1.2rem' }}>
        {author ? 'Yes, author object was found.' : 'No, author object is undefined.'}
      </p>

      <hr />

      <h2>2. Raw Author Data:</h2>
      <pre style={{ border: '1px solid #555', padding: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(author, null, 2)}
      </pre>
    </div>
  )
}