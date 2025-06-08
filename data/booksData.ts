interface Book {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const booksData: Book[] = [
  {
    title: 'Managing Agile Open-Source Software Projects with Visual Studio Online',
    description: `With this ebook, the ALM Rangers share their best practices in managing solution
    requirements and shipping solutions in an agile environment, an environment where transparency,
    simplicity, and trust prevail. The ebook is for Agile development teams and their Scrum Masters
    who want to explore and learn from the authors' "dogfooding" experiences and their continuous
    adaptation of software requirements management. Product Owners and other stakeholders will
    also find value in this ebook by learning how they can support their Agile development
    teams and by gaining an understanding of the constraints of open-source community projects.`,
    imgSrc: '/static/images/books/managing-agile-open-source.png',
    href: 'https://www.microsoftpressstore.com/store/managing-agile-open-source-software-projects-with-visual-9781509300648',
  },
  {
    title: 'Team Foundation Server 2015 Customization',
    description: `Team Foundation Server is an efficacious collaboration tools that will allow
    you to share code, track records, software, all in a single package. Integrate it with your
    existing IDE or editor and let your team work in a flexible environment that adapts to
    projects of all shapes and sizes.

    Explore what gives you the edge over other developers by knowing the tips and quick fixes
    of customizing TFS. Effectively minimize the time users spend interacting with TFS so that
    they can be more productive.`,
    imgSrc: '/static/images/books/team-foundation-server-2015-customization.png',
    href: 'https://a.co/d/9sjOWsa',
  },
  {
    title: 'Team Foundation Server 2013 Customization',
    description: `This book utilizes a tutorial based approach, focused on the practical
    customization of key features of the Team Foundation Server for collaborative enterprise
    software projects. This practical guide is intended for those who want to extend TFS.
    This book is for intermediate users who have an understanding of TFS, and basic coding
    skills will be required for the more complex customizations.`,
    imgSrc: '/static/images/books/team-foundation-server-2013-customization.png',
    href: 'https://a.co/d/8Cv5BJH',
  },
]

export default booksData
