import Link from './Link'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

const SkipLink = ({ href, children }: SkipLinkProps) => {
  return (
    <Link
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-800 focus:text-white focus:rounded-md focus:shadow-lg focus:no-underline dark:focus:bg-primary-400 dark:focus:text-gray-900"
    >
      {children}
    </Link>
  )
}

export default SkipLink