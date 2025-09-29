#!/usr/bin/env tsx
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

import connectToDatabase from '../src/lib/mongodb';
import ProjectModel from '../src/models/Project';
import UserModel from '../src/models/User';

type EvidenceRow = {
  repository: string;
  role: string;
  evidence_type: string;
  file_path: string;
  description: string;
};

type UrlRow = {
  repository: string;
  role: string;
  github_url: string;
};

function readCsv<T = any>(csvPath: string): T[] {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const res = Papa.parse<T>(raw, { header: true, skipEmptyLines: true });
  if (res.errors?.length) {
    console.warn(`CSV parse warnings for ${csvPath}:`, res.errors);
  }
  return res.data as T[];
}

function normalizeTag(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '-');
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function prettifyName(raw: string): string {
  const cleaned = raw
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned
    .split(' ')
    .map(w =>
      w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ');
}

// Simple mapping from resume role → portfolio category label
const roleCategoryMap: Record<string, string> = {
  'Cybersecurity Engineer': 'Security',
  'Full Stack Developer': 'Full-Stack',
  'Flutter Developer': 'Mobile',
  'DevOps Engineer': 'DevOps',
  'Python Backend Developer': 'Backend',
  'Cloud Solutions Architect': 'Cloud',
  'Linux Systems Administrator': 'Systems',
  'Site Reliability Engineer': 'SRE',
  'Open Source Developer': 'Open Source',
  'Android Systems Developer': 'Android',
};

function mapRoleToCategory(role: string): string {
  if (!role) return 'General';
  if (roleCategoryMap[role]) return roleCategoryMap[role];
  const r = role.toLowerCase();
  if (r.includes('cloud')) return 'Cloud';
  if (r.includes('android')) return 'Android';
  if (r.includes('flutter') || r.includes('mobile')) return 'Mobile';
  if (r.includes('full') && r.includes('stack')) return 'Full-Stack';
  if (r.includes('backend')) return 'Backend';
  if (r.includes('security')) return 'Security';
  if (r.includes('devops')) return 'DevOps';
  if (r.includes('sre')) return 'SRE';
  if (r.includes('linux') || r.includes('system')) return 'Systems';
  if (r.includes('open') && r.includes('source')) return 'Open Source';
  return 'General';
}

// Extract plausible technologies and tags from evidence
function inferTechAndTags(row: EvidenceRow): {
  technologies: string[];
  tags: string[];
} {
  const tech: string[] = [];
  const tags: string[] = [];
  const repo = row.repository.toLowerCase();
  const desc = `${row.evidence_type} ${row.description}`.toLowerCase();

  // Core languages & frameworks
  if (/python/.test(desc) || /python/.test(repo)) tech.push('Python');
  if (/node\.js|nodejs|node\b/.test(desc) || /node/.test(repo))
    tech.push('Node.js');
  if (/typescript/.test(desc) || /typescript/.test(repo))
    tech.push('TypeScript');
  if (/javascript/.test(desc)) tech.push('JavaScript');
  if (/go\b|golang/.test(desc) || /go-/.test(repo)) tech.push('Go');
  if (/(rust|cargo)/.test(desc) || /rust/.test(repo)) tech.push('Rust');
  if (/java\b/.test(desc) || /java/.test(repo)) tech.push('Java');
  if (/kotlin/.test(desc) || /kotlin/.test(repo)) tech.push('Kotlin');
  if (/(c\+\+|\bc\b)/.test(desc)) tech.push('C/C++');
  if (/flutter|dart/.test(desc) || /flutter/.test(repo)) tech.push('Flutter');
  if (/flask/.test(desc) || /flask/.test(repo)) tech.push('Flask');
  if (/react/.test(desc)) tech.push('React');
  if (/next\.js|nextjs/.test(desc) || /next/.test(repo)) tech.push('Next.js');

  // Databases / storage
  if (/mongodb|mongo\b/.test(desc) || /mongo/.test(repo)) tech.push('MongoDB');
  if (/postgres|postgre/.test(desc)) tech.push('PostgreSQL');
  if (/mysql/.test(desc)) tech.push('MySQL');
  if (/sqlite/.test(desc)) tech.push('SQLite');
  if (/redis/.test(desc)) tech.push('Redis');
  if (/prisma/.test(desc)) tech.push('Prisma');

  // DevOps / infra
  if (/docker|container|compose/.test(desc) || /docker/.test(repo))
    tech.push('Docker');
  if (/(kubernetes|k8s|helm|argocd|k3s)/.test(desc)) tech.push('Kubernetes');
  if (/terraform/.test(desc) || /tf-/.test(repo)) tech.push('Terraform');
  if (/ansible/.test(desc)) tech.push('Ansible');
  if (/(github actions|workflow|ci\/cd|ci\/)/.test(desc))
    tech.push('GitHub Actions');
  if (/nix|nixos/.test(repo) || /nix|nixos/.test(desc)) tech.push('Nix');
  if (/proxmox/.test(desc) || /proxmox/.test(repo)) tech.push('Proxmox');
  if (/nginx/.test(desc) || /nginx/.test(repo)) tech.push('Nginx');
  if (/apache/.test(desc)) tech.push('Apache');

  // Cloud
  if (/aws\b|amazon web services/.test(desc)) tech.push('AWS');
  if (/gcp\b|google cloud/.test(desc)) tech.push('GCP');
  if (/azure/.test(desc)) tech.push('Azure');
  if (/cloudflare/.test(desc)) tech.push('Cloudflare');
  if (/vercel/.test(desc)) tech.push('Vercel');

  // Mobile / Android / Kernel
  if (/kernel|android/.test(repo) || /aosp|android/.test(desc))
    tech.push('Android');
  if (/kernelsu/.test(desc) || /kernelsu/.test(repo)) tech.push('Kernel');

  // Auth / payments
  if (/jwt|auth|authentication|sso|biometric/.test(desc)) tech.push('Auth');
  if (/stripe/.test(desc)) tech.push('Stripe');

  // Tags from role + repository name + evidence_type
  [row.role, row.repository, row.evidence_type].forEach(s => {
    if (!s) return;
    const t = normalizeTag(s);
    if (!tags.includes(t)) tags.push(t);
  });
  // tags from description keywords
  [
    'security',
    'sso',
    'biometric',
    'rate-limiting',
    'ip-blocking',
    'docker',
    'ci-cd',
    'microservices',
    'flutter',
    'flask',
    'mongodb',
    'open-source',
    'kernel',
    'android',
    'nixos',
  ].forEach(k => {
    if (desc.includes(k.replace('-', ' ')) || desc.includes(k)) {
      const t = normalizeTag(k);
      if (!tags.includes(t)) tags.push(t);
    }
  });

  const uniqueTech = Array.from(new Set(tech));
  const uniqueTags = Array.from(new Set(tags));
  return { technologies: uniqueTech, tags: uniqueTags };
}

async function run() {
  await connectToDatabase();

  const admin = await UserModel.findOne({ role: 'admin' });
  if (!admin) {
    throw new Error('Admin user not found. Run: pnpm admin:create-db-admin');
  }

  const dataDir = path.join(process.cwd(), 'data', 'github-evidence');
  const evidenceCsv = path.join(
    dataDir,
    'complete_project_evidence_mapping.csv'
  );
  const urlsCsv = path.join(dataDir, 'github_project_urls.csv');

  const evidence = readCsv<EvidenceRow>(evidenceCsv);
  const urlRows = readCsv<UrlRow>(urlsCsv);
  const urlMap = new Map<string, string>();
  urlRows.forEach(r => {
    // prefer the latest occurrence
    if (r.repository && r.github_url) urlMap.set(r.repository, r.github_url);
  });

  // Known forked repositories (from attached analysis)
  const forkedSet = new Set(
    [
      'Karmstrot-Builds',
      'android_kernel_oneplus_sm8250',
      'kernel_oneplus_sm8250',
      'Anomaly-Kernel',
      'po_kernel_oneplus_sm8250',
      'KernelSU',
      'device_oneplus_opkona',
      'AnyKernel3-SM8250',
      'AppManager',
    ].map(n => n.toLowerCase())
  );

  // Group evidence by repository + role creating one project per pair
  const groups = new Map<string, EvidenceRow[]>();
  for (const row of evidence) {
    const key = `${row.repository}__${row.role}`;
    const arr = groups.get(key) || [];
    arr.push(row);
    groups.set(key, arr);
  }

  let created = 0;
  let updated = 0;

  for (const [key, rows] of groups.entries()) {
    const [repository, role] = key.split('__');
    const category = mapRoleToCategory(role);

    // Keep slug stable using the previous base while improving display title
    const slugBase = `${role}: ${repository}`;
    const slug = toSlug(slugBase);
    const title = prettifyName(repository);

    const githubUrl = urlMap.get(repository) || '';
    const description =
      rows[0]?.description || `${repository} evidence for ${role}`;
    const longDescription = rows
      .map(r => `- ${r.evidence_type}: ${r.description} (${r.file_path})`)
      .join('\n');

    const allTech = new Set<string>();
    const allTags = new Set<string>();
    rows.forEach(r => {
      const { technologies, tags } = inferTechAndTags(r);
      technologies.forEach(t => allTech.add(t));
      tags.forEach(t => allTags.add(t));
    });

    const isFork =
      forkedSet.has(repository.toLowerCase()) || /fork/i.test(description);
    // Multi-category inference
    const extraCategories = new Set<string>();
    const lowerRepo = repository.toLowerCase();
    const lowerRole = role.toLowerCase();
    const descAll = rows.map(r => r.description.toLowerCase()).join(' ');
    const pushCat = (c: string) => {
      if (c && c !== category) extraCategories.add(c);
    };
    if (
      /security|pentest|auth|jwt|owasp|cve|mitre/.test(descAll) ||
      /security/.test(lowerRole)
    )
      pushCat('Security');
    if (
      /backend|api|server|microservice/.test(descAll) ||
      /backend/.test(lowerRole)
    )
      pushCat('Backend');
    if (/android|kernel|aosp/.test(descAll) || /android/.test(lowerRole))
      pushCat('Android');
    if (/cloud|aws|gcp|azure|vercel|cloudflare/.test(descAll)) pushCat('Cloud');
    if (/devops|kubernetes|docker|terraform|ci|cd|ansible|nix/.test(descAll))
      pushCat('DevOps');
    if (/flutter|mobile/.test(descAll)) pushCat('Mobile');
    if (/system|linux|kernel|proxmox/.test(descAll)) pushCat('Systems');

    // Specific overrides/examples
    if (lowerRepo.includes('second_brain_database')) {
      pushCat('Backend');
      pushCat('Security');
    }

    const doc = {
      title,
      slug,
      description: description.slice(0, 480),
      longDescription,
      category,
      categories: Array.from(extraCategories),
      technologies: Array.from(allTech),
      status: 'published' as const,
      featured: false,
      images: [],
      demoUrl: githubUrl || undefined,
      sourceUrl: githubUrl || undefined,
      liveUrl: undefined,
      startDate: undefined,
      endDate: undefined,
      client: undefined,
      tags: Array.from(
        new Set([...(isFork ? ['forked'] : ['original']), ...allTags])
      ),
      viewCount: Math.floor(Math.random() * 250),
      authorId: admin._id,
    };

    // Exclude any aggregate/placeholder card
    const isAggregate =
      /all\s*repositories/i.test(title) || /aggregate/i.test(description);
    if (isAggregate) {
      continue;
    }

    const existing = await ProjectModel.findOne({ slug });
    if (existing) {
      existing.set(doc as any);
      await existing.save();
      updated += 1;
    } else {
      await ProjectModel.create(doc as any);
      created += 1;
    }
  }

  console.log(
    `Portfolio seeding complete. Created: ${created}, Updated: ${updated}`
  );
  process.exit(0);
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
