import Link from '@/components/Link'
import Image from '@/components/Image'
import GitHubStars from '@/components/GitHubStars'
import projectsData from '@/data/projectsData'
import { genPageMetadata } from 'src/app/seo'

export const metadata = genPageMetadata({
  title: 'Projects',
  description: 'Side projects and open-source tools I build and maintain',
})

export default function Page() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pt-10 pb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Projects
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Side projects and open-source tools I build and maintain
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectsData.map((project) => (
          <article key={project.title} className="group">
            <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
              <div className="space-y-4">
                {/* Header: Title + Stars + Logo */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                      {project.title}
                    </h2>
                    {project.githubStars && (
                      <Link
                        href={`https://github.com/${project.githubStars}`}
                        className="mt-1 inline-block hover:opacity-80 transition-opacity"
                        aria-label={`Star ${project.title} on GitHub`}
                      >
                        <GitHubStars repo={project.githubStars} />
                      </Link>
                    )}
                  </div>
                  {project.imgSrc && (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={project.imgSrc}
                        alt={`${project.title} logo`}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300">{project.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-800 dark:text-primary-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="mt-auto flex items-center gap-4 pt-6">
                {project.href && (
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-800 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                    aria-label={`Visit ${project.title} website`}
                  >
                    Website
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                )}
                {project.github && (
                  <Link
                    href={project.github}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={`${project.title} on GitHub`}
                  >
                    GitHub
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
