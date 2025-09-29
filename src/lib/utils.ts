import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const KNOWN_TECH_LABELS: Record<string, string> = {
  nextjs: 'Next.js',
  next: 'Next.js',
  'github actions': 'GitHub Actions',
  'github-actions': 'GitHub Actions',
  nodejs: 'Node.js',
  node: 'Node.js',
  mongodb: 'MongoDB',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  sqlite: 'SQLite',
  aws: 'AWS',
  gcp: 'GCP',
  'ci/cd': 'CI/CD',
  'ci-cd': 'CI/CD',
  cloudflare: 'Cloudflare',
  vercel: 'Vercel',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  terraform: 'Terraform',
  ansible: 'Ansible',
  nix: 'Nix',
  proxmox: 'Proxmox',
  nginx: 'Nginx',
  apache: 'Apache',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  react: 'React',
  flutter: 'Flutter',
  flask: 'Flask',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  android: 'Android',
  kernel: 'Kernel',
  prisma: 'Prisma',
  redis: 'Redis',
  stripe: 'Stripe',
  auth: 'Auth',
};

export function formatTechLabel(input: string): string {
  const key = String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/_/g, '-');
  if (KNOWN_TECH_LABELS[key]) return KNOWN_TECH_LABELS[key];
  // Title case fallback while preserving hyphenated chunks
  return key
    .split('-')
    .map(chunk => chunk.replace(/\b\w/g, c => c.toUpperCase()))
    .join('-')
    .replace(/\bCi\b/g, 'CI')
    .replace(/\bCd\b/g, 'CD');
}
