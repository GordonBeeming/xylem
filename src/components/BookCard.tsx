import Image from './Image'
import Link from './Link'

const BookCard = ({ title, description, imgSrc, href }) => { // <-- Note the curly brace
  return ( // <-- Note the added "return" keyword
    <div className="flex h-full flex-col overflow-hidden rounded-md border-2 border-gray-200/60 dark:border-gray-700/60">
      {imgSrc && (
        <div className="flex items-center justify-center p-4"> {/* Added padding here for spacing */}
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              <Image
                alt={title}
                src={imgSrc}
                className="object-contain"
                width={270}
                height={270}
              />
            </Link>
          ) : (
            <Image
              alt={title}
              src={imgSrc}
              className="object-contain"
              width={270}
              height={270}
            />
          )}
        </div>
      )}
      <div className="flex flex-grow flex-col p-6 pt-0"> {/* Removed top padding to balance */}
        <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="prose mb-3 max-w-none flex-grow text-gray-500 dark:text-gray-400">
          {description}
        </p>
        {href && (
          <Link
            href={href}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
            aria-label={`Link to ${title}`}
          >
            Learn more &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}

export default BookCard