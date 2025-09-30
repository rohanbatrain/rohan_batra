import { skillsData } from '@/data/skills';

// Synonym -> canonical tag map
const CANONICAL_MAP: Record<string, string> = {
  cp: 'competitive programming',
  'comp prog': 'competitive programming',
  auth: 'authentication',
  jwt: 'jwt',
  dsa: 'dsa',
  leetcode: 'leetcode',
  gfg: 'gfg',
  codeforces: 'codeforces',
  sec: 'security',
};

export function normalizeTag(tag: string): string {
  const t = String(tag || '').trim().toLowerCase();
  return CANONICAL_MAP[t] || t;
}

export function canonicalizeTags(tags: Array<string | undefined | null>): string[] {
  return Array.from(
    new Set(
      (tags || [])
        .map(t => (t == null ? '' : String(t)))
        .map(normalizeTag)
        .filter(Boolean)
    )
  );
}

export function mapTagsToSkills(tags: string[]): { slug: string; title: string; Icon: any }[] {
  const canon = new Set(canonicalizeTags(tags));
  return skillsData
    .filter(skill =>
      (skill.blogTags || []).some(t => canon.has(normalizeTag(t))) ||
      (skill.projectTags || []).some(t => canon.has(normalizeTag(t)))
    )
    .map(s => ({ slug: s.slug, title: s.title, Icon: s.Icon }));
}
