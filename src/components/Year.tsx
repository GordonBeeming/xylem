import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Year = ({ text }: Props) => {
  return (
    <Link
      href={`/years/${slug(text)}`}
      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mr-3 text-sm font-medium uppercase"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Year
