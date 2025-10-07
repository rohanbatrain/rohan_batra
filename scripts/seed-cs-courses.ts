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
    summary:
      'Comprehensive coverage of classical and modern encryption techniques, public/private key cryptography, cryptographic hash functions, digital signatures, authentication protocols, and network security principles including VPNs, TLS/SSL, and wireless security.',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours (300+600+600+600+600 = 2700)
    categories: ['Core', 'Cybersecurity', 'Computer Science'],
    tags: [
      'Cryptography',
      'Security',
      'Networks',
      'DES',
      'AES',
      'RSA',
      'TLS',
      'VPN',
      'SSL',
      'Hash Functions',
      'Digital Signatures',
    ],
  },
  {
    title: 'Formal Languages and Automata Theory',
    slug: 'formal-languages-and-automata-theory',
    subtitle: 'Theory of Automata and Computability',
    summary:
      'In-depth study of finite automata, regular languages, context-free grammars, pushdown automata, Turing machines, decidability, and computational complexity. Covers pumping lemmas, minimization algorithms, and NP-completeness.',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours (900+900+600+300 = 2700)
    categories: ['Core', 'Theoretical CS', 'Computer Science'],
    tags: [
      'Automata',
      'FSM',
      'PDA',
      'Turing Machine',
      'NP-Hard',
      'Regular Languages',
      'Context-Free Grammar',
      'Decidability',
      'Pumping Lemma',
    ],
  },
  {
    title: 'Object Oriented Analysis and Design',
    slug: 'object-oriented-analysis-and-design',
    subtitle: 'Object-Oriented Modeling with UML',
    summary:
      'Comprehensive study of object-oriented principles, UML diagrams, design patterns, architectural modeling, and system analysis. Covers use cases, class diagrams, sequence diagrams, state machines, and modern architectural patterns including DDD, SOA, and cloud architectures.',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours (600+600+600+600+300 = 2700)
    categories: [
      'Core',
      'Software Design',
      'Software Engineering',
      'Computer Science',
    ],
    tags: [
      'UML',
      'OOAD',
      'Design Patterns',
      'Architecture',
      'Use Cases',
      'Class Diagrams',
      'Sequence Diagrams',
      'State Machines',
      'DDD',
      'SOA',
    ],
  },
  {
    title: 'Research Methodology in Computer Science',
    slug: 'research-methodology-in-computer-science',
    subtitle: 'Research Skills and Intellectual Property',
    summary:
      'Essential research skills including problem identification, research methodologies, proof techniques, literature review, technical writing, research ethics, intellectual property rights, patents, and technology transfer in computer science.',
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2400, // 40 hours (540+780+480+300+300 = 2400)
    categories: ['Core', 'Research', 'Computer Science'],
    tags: [
      'Research Methods',
      'IPR',
      'Technical Writing',
      'Patents',
      'Ethics',
      'Literature Review',
      'Proof Techniques',
      'Technology Transfer',
    ],
  },
  {
    title: 'Probability, Entropy, and Monte Carlo Simulation',
    slug: 'probability-entropy-and-monte-carlo-simulation',
    subtitle: 'Probability Theory and Stochastic Simulation',
    summary:
      'Rigorous foundations in probability theory, random variables, special distributions, jointly distributed random variables, limit theorems, information theory, entropy, KL divergence, and Monte Carlo simulation techniques for computational applications.',
    difficulty: 'advanced' as const,
    status: 'draft' as const,
    visibility: 'public' as const,
    estimatedDurationMinutes: 2700, // 45 hours (540+480+540+420+420+300 = 2700)
    categories: ['Core', 'Theoretical CS', 'Mathematics', 'Computer Science'],
    tags: [
      'Probability',
      'Entropy',
      'Monte Carlo',
      'Distributions',
      'Random Variables',
      'Information Theory',
      'Simulation',
      'Stochastic Methods',
      'KL Divergence',
    ],
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
