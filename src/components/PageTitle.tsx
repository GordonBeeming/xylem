import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  id?: string
}

export default function PageTitle({ children, id }: Props) {
  return (
    <h1 
      id={id}
      className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-gray-100"
    >
      {children}
    </h1>
  )
}
