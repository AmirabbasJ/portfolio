export const profile = {
  name: 'Amirabbas Jalali',
  title: 'Frontend Engineer',
  summary:
    'Experienced React and Next.js developer with 4+ years of expertise in delivering top-notch web applications. Proficient in selecting ideal technologies and tools for diverse domains and challenges, dedicated to continuous learning and skill enhancement to provide innovative solutions that surpass expectations.',
  contact: {
    email: 'amirabbasjalali82@gmail.com',
    github: 'AmirabbasJ',
    githubUrl: 'https://github.com/AmirabbasJ',
    linkedin: 'amirabbas-jalali',
    linkedinUrl: 'https://www.linkedin.com/in/amirabbas-jalali',
  },
} as const

export type Experience = {
  company: string
  location: string
  role: string
  period: string
  summary: string
  tech: string[]
  highlights: string[]
}

export const experience: Experience[] = [
  {
    company: 'Linkdent',
    location: 'Netherlands',
    role: 'Full-Stack Engineer (Freelance)',
    period: 'January 2026 — Present',
    summary:
      'Architected and developed LinkDent, a multi-tenant B2B platform for dental clinics, practitioners, and administrators. Owned the complete system design and implementation, delivering a production-ready application that streamlined dental product ordering, communication, and clinic management.',
    tech: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Material UI',
      'Supabase',
    ],
    highlights: [
      'Designed the application architecture, database schema, and user workflows from the ground up.',
      'Built the frontend and backend independently using Next.js, React, TypeScript, and Supabase.',
      'Developed secure role-based dashboards for Administrators, Clinic Owners, and Dentists.',
      'Implemented a dental product ordering system with order tracking, invoices, and monthly billing.',
      'Integrated real-time messaging using Supabase Realtime. Implemented authentication, password recovery, Row-Level Security (RLS), and authorization.',
    ],
  },
  {
    company: 'ThePersa',
    location: 'Canada',
    role: 'Frontend Engineer',
    period: 'June 2025 — December 2025',
    summary:
      'Contributed to Shody Admin Panel, a comprehensive platform for doctors to monitor and manage patients’ daily health routines. Collaborated with backend engineers and designers to build intuitive, data-driven dashboards visualizing nutrition, hydration, and physical activity.',
    tech: [
      'React',
      'TypeScript',
      'React Query',
      'Tailwind CSS',
      'Shadcn/UI',
      'AI Integration',
    ],
    highlights: [
      'Developed and maintained core features for patient monitoring, appointment scheduling, and AI-generated health summaries.',
      'Transformed AI-generated frontend code into clean, reusable, production-quality components following engineering best practices.',
      'Implemented reusable UI components and optimized performance for medical professionals.',
      'Worked cross-functionally with product and design to turn complex health data into clear, actionable insights.',
    ],
  },
  {
    company: 'Dropp',
    location: 'Gorgan',
    role: 'Senior Frontend Engineer',
    period: 'March 2023 — May 2025',
    summary:
      'Part of a fast-moving software team building and maintaining complex web applications and internal dashboards for a variety of clients. Worked closely with designers and backend engineers to deliver scalable, high-quality interfaces using React and Next.js.',
    tech: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'Shadcn/UI',
      'React Query',
      'Redux',
      'Zustand',
      'GraphQL',
      'Apollo Client',
      'Storybook',
      'Chromatic',
      'Cypress',
      'Jest',
      'Docker',
      'Git',
    ],
    highlights: [
      'Spearheaded the creation and upkeep of the ISR website and an advanced admin panel utilizing Next.js and React.',
      'Authored comprehensive documentation and guides for packages to facilitate onboarding of future developers.',
      'Provided mentorship to interns and conducted interviews to identify top talent.',
      'Simultaneously managed multiple diverse projects with distinct domains and unique requirements.',
      'Led development and maintenance of various admin panel projects across different domains.',
      'Mentored newly joined frontend developers, helping them onboard quickly and align with team standards.',
    ],
  },
  {
    company: 'StartDone',
    location: 'Istanbul',
    role: 'Frontend Engineer',
    period: 'January 2022 — February 2023',
    summary:
      'Built high-quality, user-centered websites across diverse industries. Projects like MyStory, CreativeDigiServices, EveryLanding, and Oraligroup refined skills in design implementation, performance optimization, and cross-project consistency.',
    tech: [
      'JavaScript',
      'React',
      'Next.js',
      'Material UI',
      'GSAP',
      'Anime.js',
      'HTML',
      'CSS',
    ],
    highlights: [
      'Orchestrated Next.js integration for SSR and seamless routing, improving page load time and SEO.',
      'Streamlined UI development with Material UI.',
      'Developed and maintained 10+ production web applications across multiple industries.',
      'Used GSAP and Anime.js to create visually appealing interactive elements.',
      'Completed various front-end projects with diverse requirements and domains.',
    ],
  },
]

export const skillGroups = [
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    label: 'Frameworks',
    items: ['React', 'Next.js'],
  },
  {
    label: 'UI & Styling',
    items: [
      'Shadcn',
      'Styled-Components',
      'Tailwind',
      'Mantine',
      'MUI',
      'Ant Design',
      'Motion',
      'GSAP',
      'Three.js',
    ],
  },
  {
    label: 'Forms & Data',
    items: [
      'React-Hook-Form',
      'Formik',
      'Zod',
      'TanStack Table',
      'i18next',
      'React-Query',
      'Redux',
      'Zustand',
      'GraphQL',
      'Apollo Client',
    ],
  },
  {
    label: 'Tooling',
    items: ['Vite', 'Webpack', 'Babel', 'PWA'],
  },
  {
    label: 'Testing',
    items: ['Cypress', 'Storybook', 'Chromatic', 'Jest', 'Mocha', 'Vitest'],
  },
  {
    label: 'Platform',
    items: [
      'NPM',
      'VSCode',
      'Cursor',
      'ESLint',
      'Prettier',
      'Jira',
      'Linear',
      'Git',
      'GitHub',
      'Supabase',
      'Node.js',
      'Express',
      'MongoDB',
      'Docker',
      'Linux',
    ],
  },
] as const
