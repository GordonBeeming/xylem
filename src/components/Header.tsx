import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'

const Header = () => {
  let headerClass = 'flex flex-wrap items-center w-full bg-white dark:bg-gray-800 justify-between py-6 border-b border-gray-200 dark:border-gray-700 px-6 sm:px-8 gap-y-2'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass} role="banner">
      <Link href="/" aria-label={`${siteMetadata.headerTitle} - Home`}>
        <div className="flex items-center min-w-0 flex-shrink">
          <div className="mr-3 flex-shrink-0">
            <Logo />
          </div>
          {typeof siteMetadata.headerTitle === 'string' ? (
            <div className="hidden h-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 sm:block whitespace-nowrap">
              {siteMetadata.headerTitle}
            </div>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>
      <nav className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6 flex-shrink-0" role="navigation" aria-label="Main navigation">
        <div className="no-scrollbar hidden max-w-40 items-center gap-x-4 overflow-x-auto sm:flex md:max-w-72 lg:max-w-96">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="hover:text-primary-800 dark:hover:text-primary-400 m-1 font-medium text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 rounded-md px-2 py-1"
              >
                {link.title}
              </Link>
            ))}
        </div>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </nav>
    </header>
  )
}

export default Header
