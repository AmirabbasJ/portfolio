export const profile = {
  name: 'Amirabbas Jalali',
  title: 'Frontend Engineer',
  summary:
    'Frontend engineer with 4+ years of experience specializing in React and Next.js. I enjoy turning ideas into polished, maintainable applications and exploring the technologies that help solve real-world problems effectively.',
  contact: {
    email: 'amirabbasjalali82@gmail.com',
    github: 'AmirabbasJ',
    githubUrl: 'https://github.com/AmirabbasJ',
    linkedin: 'amirabbas-jalali',
    linkedinUrl: 'https://www.linkedin.com/in/amirabbas-jalali',
  },
} as const;

export interface Experience {
  company: string;
  location: string;
  role: string;
  period: string;
  summary: string;
  tech: string[];
  highlights: string[];
}

export const experience: Experience[] = [
  {
    company: 'Tandartspraktijk Westeinde',
    location: 'Netherlands',
    role: 'Full-Stack Engineer',
    period: 'January 2026 — Present',
    summary:
      'Designed and launched a full-stack B2B platform from concept to production, now serving 500+ users across Administrators, Clinic Owners, and Dentists.',
    tech: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Material UI',
      'Supabase',
    ],
    highlights: [
      'Architected the frontend, backend, database schema, authentication, and role-based access control for a multi-role platform serving dental professionals.',
      'Built 4 core modules covering product ordering, patient management, real-time messaging, and billing workflows.',
      'Collaborated directly with stakeholders across 10+ major feature iterations, translating evolving requirements into production-ready solutions.',
      'Developed role-specific dashboards for Administrators, Clinic Owners, and Dentists, translating complex business workflows into intuitive interfaces.',
      'Took ownership of the entire development lifecycle, independently planning features, prioritizing implementation, and delivering milestones on schedule.',
      'Balanced technical decisions with business needs, ensuring the platform remained scalable, maintainable, and aligned with client expectations.',
    ],
  },
  {
    company: 'ThePersa',
    location: 'Canada',
    role: 'Frontend Engineer',
    period: 'May 2025 — January 2026',
    summary:
      'Engineered and scaled a healthcare administration platform, collaborating with cross-functional teams to deliver scalable, user-focused solutions.',
    tech: [
      'React',
      'TypeScript',
      'React Query',
      'Tailwind CSS',
      'Shadcn/UI',
      'AI Integration',
    ],
    highlights: [
      'Built and shipped core features for a healthcare platform used by medical professionals to monitor patient health and daily routines.',
      'Refactored an AI-assisted frontend into a scalable React architecture with reusable components and consistent engineering patterns.',
      'Orchestrated the delivery of user-centric, data-driven dashboards by aligning with backend engineers, designers, and product stakeholders.',
      'Contributed to technical discussions, feature planning, and code reviews to maintain consistency and code quality across the project.',
    ],
  },
  {
    company: 'Dropp',
    location: 'Iran',
    role: 'Senior Frontend Engineer',
    period: 'February 2023 — May 2025',
    summary:
      'Worked as a Senior Frontend Engineer, delivering scalable web applications and admin dashboards for clients across multiple industries while collaborating with cross-functional teams in a fast-paced environment.',
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
      'Led frontend development across multiple client projects, delivering scalable web applications and admin dashboards for diverse business domains.',
      'Coordinated cross-functional delivery with designers, backend engineers, and project managers to ship high-quality features within tight deadlines.',
      'Mentored a junior frontend developer through onboarding, code reviews, and day-to-day technical guidance, helping them quickly become productive and align with team best practices.',
      'Authored technical documentation and onboarding guides to improve knowledge sharing and reduce ramp-up time for new team members.',
      'Balanced multiple concurrent projects while maintaining code quality, performance, and delivery timelines.',
    ],
  },
  {
    company: 'StartDone',
    location: 'Turkey',
    role: 'Frontend Engineer',
    period: 'January 2022 — February 2023',
    summary:
      'Built responsive, high-quality web applications for clients across diverse industries, focusing on performance, usability, and maintainable frontend architecture.',
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
      'Orchestrated the integration of the Next.js framework, enabling efficient server-side rendering and seamless routing, resulting in a reduction in page load time and an increase in search engine rankings.',
      'Designed and delivered responsive websites for clients across multiple industries using React.',
      'Worked closely with designers to translate UI/UX concepts into polished, production-ready user interfaces.',
      'Optimized website performance and SEO through server-side rendering and frontend best practices.',
      'Drove delivery across multiple client projects, adapting solutions to diverse business requirements while consistently meeting evolving timelines.',
    ],
  },
];

export const skillGroups = [
  {
    label: 'Languages',
    items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    label: 'Frameworks',
    items: ['React', 'Next.js', 'TanStack Start'],
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
] as const;
