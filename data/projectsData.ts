interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
  techStack: string[]
  github?: string
  githubStars?: string // GitHub owner/repo for shields.io stars badge (e.g. 'GordonBeeming/copilot_here')
  featured: boolean
}

const projectsData: Project[] = [
  {
    title: 'copilot_here',
    description: `Secure, portable CLI wrapper for GitHub Copilot CLI that runs inside a sandboxed Docker container. Keeps your credentials and environment isolated while giving you the full power of Copilot suggestions right in your terminal.`,
    href: 'https://copilot_here.gordonbeeming.com',
    imgSrc: '/static/images/projects/copilot-here.png',
    techStack: ['C#', '.NET', 'Rust', 'Docker'],
    github: 'https://github.com/GordonBeeming/copilot_here',
    githubStars: 'GordonBeeming/copilot_here',
    featured: true,
  },
  {
    title: 'ClaudeNest',
    description: `Remote session launcher for Claude Code — browse dev folders and launch remote-control sessions from anywhere via a web dashboard. Perfect for managing Claude Code across multiple machines.`,
    href: 'https://claudenest.app',
    imgSrc: '/static/images/projects/claudenest.png',
    techStack: ['.NET', 'React', 'SignalR', 'Azure'],
    github: 'https://github.com/GordonBeeming/ClaudeNest',
    githubStars: 'GordonBeeming/ClaudeNest',
    featured: true,
  },
  {
    title: 'HardPhase Tracker',
    description: `Minimalist iOS fasting tracker app with meal logging, fasting templates, and Apple Health integration. Track your fasting windows with a clean, intuitive interface.`,
    href: 'https://hardphasetracker.gordonbeeming.com',
    imgSrc: '/static/images/projects/hardphase-tracker.png',
    techStack: ['Swift', 'SwiftUI', 'SwiftData'],
    github: 'https://github.com/GordonBeeming/HardPhaseTracker',
    featured: true,
  },
]

export default projectsData
