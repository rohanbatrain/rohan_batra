import { Code, Palette, Rocket, ShieldCheck, Smartphone, Workflow, FlaskConical, Cloud, Terminal, Gauge, GitBranch, Cpu } from 'lucide-react';

export type SkillCategoryKey =
  | 'security'
  | 'backend'
  | 'mobile'
  | 'devops-cloud'
  | 'systems-sre'
  | 'ux-perf'
  | 'open-source';

export type SkillDef = {
  slug: string;
  title: string;
  description: string;
  Icon: any;
  color: string;
  category: SkillCategoryKey;
  blogTags: string[];
  projectTags: string[];
};

export const skillCategories: { key: SkillCategoryKey; label: string }[] = [
  { key: 'security', label: 'Security' },
  { key: 'backend', label: 'Backend & Web' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'devops-cloud', label: 'DevOps & Cloud' },
  { key: 'systems-sre', label: 'Systems & SRE' },
  { key: 'ux-perf', label: 'UX & Performance' },
  { key: 'open-source', label: 'Open Source' },
];

export const skillsData: SkillDef[] = [
  {
    slug: 'cybersecurity-engineer',
    title: 'Cybersecurity Engineer',
    description: 'Security implementation, authentication, rate limiting',
    Icon: ShieldCheck,
    color: 'text-red-600',
    category: 'security',
    blogTags: ['security', 'authentication', 'rate limiting'],
    projectTags: ['security', 'auth', 'jwt'],
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    description: 'End-to-end web development with Flask, MongoDB, and Flutter',
    Icon: Code,
    color: 'text-blue-600',
    category: 'backend',
    blogTags: ['full stack', 'flask', 'mongodb'],
    projectTags: ['full stack', 'flask', 'mongodb'],
  },
  {
    slug: 'flutter-developer',
    title: 'Flutter Developer',
    description: 'Cross-platform mobile development specialist',
    Icon: Smartphone,
    color: 'text-cyan-600',
    category: 'mobile',
    blogTags: ['flutter', 'mobile'],
    projectTags: ['flutter', 'mobile'],
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'CI/CD, containerization, infrastructure automation',
    Icon: Workflow,
    color: 'text-amber-600',
    category: 'devops-cloud',
    blogTags: ['devops', 'docker', 'ci/cd'],
    projectTags: ['devops', 'docker', 'ci/cd'],
  },
  {
    slug: 'python-backend-developer',
    title: 'Python Backend Developer',
    description: 'Flask APIs, MongoDB, scalable backend systems',
    Icon: FlaskConical,
    color: 'text-green-600',
    category: 'backend',
    blogTags: ['python', 'backend', 'flask'],
    projectTags: ['python', 'backend', 'flask'],
  },
  {
    slug: 'cloud-solutions-architect',
    title: 'Cloud Solutions Architect',
    description: 'Microservices, platform-agnostic solutions',
    Icon: Cloud,
    color: 'text-indigo-600',
    category: 'devops-cloud',
    blogTags: ['cloud', 'microservices'],
    projectTags: ['cloud', 'microservices'],
  },
  {
    slug: 'linux-systems-administrator',
    title: 'Linux Systems Administrator',
    description: 'NixOS, system configuration, kernel development',
    Icon: Terminal,
    color: 'text-gray-600',
    category: 'systems-sre',
    blogTags: ['linux', 'nixos', 'kernel'],
    projectTags: ['linux', 'nixos', 'kernel'],
  },
  {
    slug: 'site-reliability-engineer',
    title: 'Site Reliability Engineer',
    description: 'System monitoring, performance optimization',
    Icon: Gauge,
    color: 'text-teal-600',
    category: 'systems-sre',
    blogTags: ['sre', 'monitoring', 'observability'],
    projectTags: ['sre', 'monitoring', 'observability'],
  },
  {
    slug: 'open-source-developer',
    title: 'Open Source Developer',
    description: 'Community contributions, package development',
    Icon: GitBranch,
    color: 'text-fuchsia-600',
    category: 'open-source',
    blogTags: ['open source'],
    projectTags: ['open source'],
  },
  {
    slug: 'android-systems-developer',
    title: 'Android Systems Developer',
    description: 'Kernel development, custom ROMs, mobile security',
    Icon: Cpu,
    color: 'text-emerald-600',
    category: 'mobile',
    blogTags: ['android', 'kernel'],
    projectTags: ['android', 'kernel'],
  },
  // UX/Perf originals
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    description:
      'Creating beautiful, intuitive interfaces that users love to interact with.',
    Icon: Palette,
    color: 'text-purple-600',
    category: 'ux-perf',
    blogTags: ['ui', 'ux', 'design'],
    projectTags: ['ui', 'ux', 'design'],
  },
  {
    slug: 'performance-optimization',
    title: 'Performance Optimization',
    description:
      'Optimizing applications for speed, accessibility, and search engine visibility.',
    Icon: Rocket,
    color: 'text-green-600',
    category: 'ux-perf',
    blogTags: ['performance', 'seo', 'accessibility'],
    projectTags: ['performance', 'seo', 'accessibility'],
  },
];

export function getSkillBySlug(slug: string) {
  return skillsData.find(s => s.slug === slug);
}
