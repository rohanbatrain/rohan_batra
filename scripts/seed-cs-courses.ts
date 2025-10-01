#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

import connectToDatabase from '../src/lib/mongodb';
import CourseModel from '../src/models/Course';
import UserModel from '../src/models/User';

const courses = [
  {
    title: 'Cryptography and Network Security',
    slug: 'cryptography-and-network-security',
    subtitle: 'Fundamentals of Cryptography and Secure Communication',
    summary: 'Covers classical and modern encryption, public/private key cryptography, hash functions, and network security principles',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours
    categories: ['Core', 'Cybersecurity'],
    tags: ['Cryptography', 'Security', 'Networks', 'DES', 'AES', 'RSA', 'TLS'],
  },
  {
    title: 'Formal Languages and Automata Theory',
    slug: 'formal-languages-and-automata-theory',
    subtitle: 'Theory of Automata and Computability',
    summary: 'Focuses on regular languages, CFGs, Turing machines, undecidability and NP-completeness',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours
    categories: ['Core'],
    tags: ['Automata', 'FSM', 'PDA', 'Turing', 'NP-Hard'],
  },
  {
    title: 'Object Oriented Analysis and Design',
    slug: 'object-oriented-analysis-and-design',
    subtitle: 'Object-Oriented Modeling with UML',
    summary: 'Principles of OOAD, UML diagrams, design and analysis of systems, including case studies and design patterns',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours
    categories: ['Core', 'Software Design'],
    tags: ['UML', 'OOAD', 'Design patterns', 'Architecture'],
  },
  {
    title: 'Research Methodology in Computer Science',
    slug: 'research-methodology-in-computer-science',
    subtitle: 'Research Skills in Computer Science',
    summary: 'Covers research problem formulation, methodologies, ethics, IPR, and technical writing for CS',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours
    categories: ['Core', 'Research'],
    tags: ['Research methods', 'IPR', 'Technical Writing'],
  },
  {
    title: 'Probability, Entropy, and Monte Carlo Simulation',
    slug: 'probability-entropy-and-monte-carlo-simulation',
    subtitle: 'Probability and Monte Carlo Methods',
    summary: 'Builds foundations in probability, random variables, entropy, KL divergence, and stochastic simulation',
    difficulty: 'advanced' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours
    categories: ['Core', 'Theoretical CS'],
    tags: ['Probability', 'Entropy', 'Monte Carlo', 'Distributions'],
  },
];

async function run() {
  await connectToDatabase();

  const admin = await UserModel.findOne({ role: 'admin' });
  if (!admin) {
    throw new Error('Admin user not found. Run: pnpm admin:create-db-admin');
  }

  console.log('Starting course seeding...');
  
  let created = 0;
  let updated = 0;

  for (const courseData of courses) {
    const existing = await CourseModel.findOne({ slug: courseData.slug });
    
    const doc = {
      ...courseData,
      createdBy: admin._id,
      lessonCount: 0, // Will be updated when modules/lessons are added
    };

    if (existing) {
      existing.set(doc as any);
      await existing.save();
      updated += 1;
      console.log(`✓ Updated: ${courseData.title}`);
    } else {
      await CourseModel.create(doc as any);
      created += 1;
      console.log(`✓ Created: ${courseData.title}`);
    }
  }

  console.log('\n=== Course Seeding Complete ===');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Total: ${courses.length}`);
  
  process.exit(0);
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
