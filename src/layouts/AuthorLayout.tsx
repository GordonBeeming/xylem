import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, profile_line_1, profile_line_2, email, twitter, bluesky, linkedin, github,
    company_name, company_logo_dark, company_logo_light, company_website,
    mvp_logo_dark, mvp_logo_light, mvp_website } = content

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center pt-10 pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
              About
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {siteMetadata.description.split(' - ')[1]}
            </p>
          </div>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
          <div className="flex flex-col items-center space-x-2 pt-8">
            {avatar && (
              <Image
                src={avatar}
                alt="avatar"
                width={192}
                height={192}
                className="h-48 w-48 rounded-full"
              />
            )}
            <h3 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight">{name}</h3>
            <div className="text-gray-500 dark:text-gray-400">{profile_line_1}</div>
            <div className="text-gray-500 dark:text-gray-400">{profile_line_2}</div>
            <div className="flex space-x-3 pt-6">
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="linkedin" href={linkedin} />
              <SocialIcon kind="x" href={twitter} />
              <SocialIcon kind="bluesky" href={bluesky} />
            </div>
            <a
              href={company_website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${company_name} Website`}
            >
              <div className="pt-8">
                {/* Light Theme Logo */}
                <Image
                  src={company_logo_light}
                  alt={`${company_name} Logo Light`}
                  width={200}
                  height={120}
                  className="dark:hidden"
                />
                {/* Dark Theme Logo */}
                <Image
                  src={company_logo_dark}
                  alt={`${company_name} Logo Dark`}
                  width={200}
                  height={120}
                  className="hidden dark:block"
                />
              </div>
            </a>
            <a
              href={mvp_website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} MVP Profile`}
            >
              <div className="pt-8">
                {/* Light Theme Logo */}
                <Image
                  src={mvp_logo_light}
                  alt={`MVP Logo Light`}
                  width={200}
                  height={120}
                  className="dark:hidden"
                />
                {/* Dark Theme Logo */}
                <Image
                  src={mvp_logo_dark}
                  alt={`MVP Logo Dark`}
                  width={200}
                  height={120}
                  className="hidden dark:block"
                />
              </div>
            </a>
            <div className="pt-6">
              <a
                href="/color-palette"
                className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                View my color palette →
              </a>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
