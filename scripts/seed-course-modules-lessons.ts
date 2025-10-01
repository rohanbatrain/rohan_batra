#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

import connectToDatabase from '../src/lib/mongodb';
import CourseModel from '../src/models/Course';
import CourseModuleModel from '../src/models/CourseModule';
import CourseLessonModel from '../src/models/CourseLesson';

// Course modules and lessons data
const coursesData = {
  'cryptography-and-network-security': {
    modules: [
      {
        title: 'Introduction to Cryptography',
        summary: 'Historical development, basic concepts, classical cryptography, and cryptanalysis fundamentals',
        estimatedDurationMinutes: 300, // 5 hours
        lessons: [
          { title: 'Historical Development of Cryptography', estimatedDurationMinutes: 30 },
          { title: 'Basic Concepts and Terminology', estimatedDurationMinutes: 30 },
          { title: 'Types of Attacks and Security Services', estimatedDurationMinutes: 40 },
          { title: 'Classical Cryptography and Its Limitations', estimatedDurationMinutes: 45 },
          { title: 'Stream and Block Ciphers', estimatedDurationMinutes: 45 },
          { title: 'Cryptanalysis Fundamentals', estimatedDurationMinutes: 40 },
          { title: 'Steganography', estimatedDurationMinutes: 30 },
        ],
      },
      {
        title: 'Symmetric-Key Cryptography',
        summary: 'DES, AES, cipher modes, and key distribution techniques',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Substitution and Transposition Ciphers', estimatedDurationMinutes: 45 },
          { title: 'Shannon\'s Theory: Confusion and Diffusion', estimatedDurationMinutes: 50 },
          { title: 'Feistel Structure', estimatedDurationMinutes: 55 },
          { title: 'Data Encryption Standard (DES)', estimatedDurationMinutes: 70 },
          { title: 'Triple DES', estimatedDurationMinutes: 45 },
          { title: 'Advanced Encryption Standard (AES)', estimatedDurationMinutes: 80 },
          { title: 'Block Cipher Modes of Operation', estimatedDurationMinutes: 65 },
          { title: 'Traffic Confidentiality', estimatedDurationMinutes: 40 },
          { title: 'Key Distribution', estimatedDurationMinutes: 50 },
          { title: 'Random Number Generation', estimatedDurationMinutes: 40 },
        ],
      },
      {
        title: 'Number Theory and Public-Key Cryptography',
        summary: 'RSA, Diffie-Hellman, ECC, and digital signatures',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Introduction to Graph, Ring and Field', estimatedDurationMinutes: 50 },
          { title: 'Prime and Relative Prime Numbers', estimatedDurationMinutes: 45 },
          { title: 'Modular Arithmetic', estimatedDurationMinutes: 55 },
          { title: 'Fermat\'s and Euler\'s Theorem', estimatedDurationMinutes: 60 },
          { title: 'Primality Testing', estimatedDurationMinutes: 50 },
          { title: 'Euclid\'s Algorithm', estimatedDurationMinutes: 45 },
          { title: 'Introduction to Public-Key Cryptography', estimatedDurationMinutes: 55 },
          { title: 'RSA Algorithm', estimatedDurationMinutes: 80 },
          { title: 'Diffie-Hellman Key Exchange', estimatedDurationMinutes: 60 },
          { title: 'Elliptic Curve Cryptography Basics', estimatedDurationMinutes: 50 },
          { title: 'Digital Signatures and Certificates', estimatedDurationMinutes: 50 },
        ],
      },
      {
        title: 'Cryptographic Hash Functions',
        summary: 'Hash functions, HMAC, Kerberos, and authentication services',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Properties and Applications of Hash Functions', estimatedDurationMinutes: 70 },
          { title: 'Message Digest Algorithm (MD5)', estimatedDurationMinutes: 60 },
          { title: 'SHA-1 and SHA-256', estimatedDurationMinutes: 80 },
          { title: 'HMAC (Hash-based Message Authentication Code)', estimatedDurationMinutes: 70 },
          { title: 'Kerberos Authentication', estimatedDurationMinutes: 90 },
          { title: 'X.509 Certificates', estimatedDurationMinutes: 80 },
          { title: 'Directory Authentication Service', estimatedDurationMinutes: 50 },
        ],
      },
      {
        title: 'Network Security',
        summary: 'VPNs, TLS/SSL, wireless security, and cloud security',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Secure Communication Principles', estimatedDurationMinutes: 60 },
          { title: 'Authentication and Access Control', estimatedDurationMinutes: 70 },
          { title: 'Network Attacks and Countermeasures', estimatedDurationMinutes: 80 },
          { title: 'Virtual Private Networks (VPNs)', estimatedDurationMinutes: 75 },
          { title: 'Transport Layer Security (TLS) and SSL', estimatedDurationMinutes: 90 },
          { title: 'Wireless Network Security', estimatedDurationMinutes: 70 },
          { title: 'Security in Mobile Computing', estimatedDurationMinutes: 65 },
          { title: 'Security in Cloud Computing', estimatedDurationMinutes: 90 },
        ],
      },
    ],
  },
  'formal-languages-and-automata-theory': {
    modules: [
      {
        title: 'Finite Automata & Regular Languages',
        summary: 'DFA, NFA, regular expressions, pumping lemma, and minimization',
        estimatedDurationMinutes: 900, // 15 hours
        lessons: [
          { title: 'Computational Problems vs Formal Languages', estimatedDurationMinutes: 60 },
          { title: 'Deterministic Finite Automata (DFA)', estimatedDurationMinutes: 80 },
          { title: 'Non-Deterministic Finite Automata (NFA)', estimatedDurationMinutes: 80 },
          { title: 'Regular Expression and Language', estimatedDurationMinutes: 90 },
          { title: 'Closure Properties of Regular Languages', estimatedDurationMinutes: 70 },
          { title: 'Limitations of Regular Language', estimatedDurationMinutes: 60 },
          { title: 'Pumping Lemma for Regular Languages', estimatedDurationMinutes: 90 },
          { title: 'Minimization Algorithm', estimatedDurationMinutes: 85 },
          { title: 'Myhill-Nerode Relations', estimatedDurationMinutes: 75 },
          { title: 'Mealy and Moore Machines', estimatedDurationMinutes: 80 },
        ],
      },
      {
        title: 'Grammars and Push Down Automata',
        summary: 'CFG, PDA, Chomsky classification, and parsing applications',
        estimatedDurationMinutes: 900, // 15 hours
        lessons: [
          { title: 'Grammars and Chomsky Classification', estimatedDurationMinutes: 80 },
          { title: 'Regular Grammar', estimatedDurationMinutes: 70 },
          { title: 'Context Free Grammar and Languages', estimatedDurationMinutes: 90 },
          { title: 'Ambiguity in CFGs', estimatedDurationMinutes: 70 },
          { title: 'Simplification of CFGs', estimatedDurationMinutes: 75 },
          { title: 'Normal Forms for CFGs', estimatedDurationMinutes: 85 },
          { title: 'Pumping Lemma for CFLs', estimatedDurationMinutes: 80 },
          { title: 'Applications to Parsing', estimatedDurationMinutes: 90 },
          { title: 'Pushdown Automata (PDA)', estimatedDurationMinutes: 100 },
          { title: 'PDA vs CFLs', estimatedDurationMinutes: 70 },
          { title: 'Deterministic CFLs', estimatedDurationMinutes: 60 },
          { title: 'Linearly Bounded Automata (LBA)', estimatedDurationMinutes: 70 },
        ],
      },
      {
        title: 'Turing Machine',
        summary: 'Turing machine configurations, recursive languages, and decidability',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Introduction to Turing Machines', estimatedDurationMinutes: 90 },
          { title: 'Configurations and Computations', estimatedDurationMinutes: 80 },
          { title: 'Multi-tape Turing Machines', estimatedDurationMinutes: 85 },
          { title: 'Halting vs Looping', estimatedDurationMinutes: 70 },
          { title: 'Recursive Languages', estimatedDurationMinutes: 75 },
          { title: 'Recursively Enumerable Languages', estimatedDurationMinutes: 80 },
          { title: 'Decidable and Undecidable Languages', estimatedDurationMinutes: 120 },
        ],
      },
      {
        title: 'Decidability & Intractability',
        summary: 'Halting problem, NP-completeness, and computational complexity',
        estimatedDurationMinutes: 300, // 5 hours
        lessons: [
          { title: 'Undecidability of Halting Problem', estimatedDurationMinutes: 75 },
          { title: 'Introduction to NP-completeness', estimatedDurationMinutes: 80 },
          { title: 'Reductions and Rice Theorem', estimatedDurationMinutes: 60 },
          { title: 'Post Correspondence Problem', estimatedDurationMinutes: 50 },
          { title: 'Church-Turing Thesis and Cook-Levin Theorem', estimatedDurationMinutes: 35 },
        ],
      },
    ],
  },
  'object-oriented-analysis-and-design': {
    modules: [
      {
        title: 'OOAD Basics',
        summary: 'Object-oriented concepts, UML fundamentals, and Rational Unified Process',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Overview of Object-Oriented System Development', estimatedDurationMinutes: 50 },
          { title: 'Basic Notion of Objects', estimatedDurationMinutes: 45 },
          { title: 'OO Concepts: Encapsulation, Inheritance, Polymorphism', estimatedDurationMinutes: 80 },
          { title: 'Benefits of OOAD', estimatedDurationMinutes: 40 },
          { title: 'The Unified Process', estimatedDurationMinutes: 60 },
          { title: 'Modeling Concepts and Techniques', estimatedDurationMinutes: 70 },
          { title: 'UML and Its Role in Software Development', estimatedDurationMinutes: 65 },
          { title: 'Class Diagrams and Use Case Diagrams', estimatedDurationMinutes: 80 },
          { title: 'Sequence Diagrams and Interaction Modeling', estimatedDurationMinutes: 60 },
          { title: 'UML Rational Unified Process (RUP)', estimatedDurationMinutes: 50 },
        ],
      },
      {
        title: 'Basic & Advanced Structural Modeling',
        summary: 'Requirements, class diagrams, design patterns, and C++ overview',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Requirement Engineering', estimatedDurationMinutes: 70 },
          { title: 'Use Case Diagrams for Requirements', estimatedDurationMinutes: 60 },
          { title: 'Class Diagrams and Components', estimatedDurationMinutes: 75 },
          { title: 'Modeling Relationships', estimatedDurationMinutes: 65 },
          { title: 'Abstract Classes, Interfaces, and Packages', estimatedDurationMinutes: 80 },
          { title: 'Class & Object Diagrams', estimatedDurationMinutes: 70 },
          { title: 'CRC Cards for Operations', estimatedDurationMinutes: 50 },
          { title: 'Design Patterns and Architectural Modeling', estimatedDurationMinutes: 85 },
          { title: 'Advanced UML Concepts', estimatedDurationMinutes: 55 },
          { title: 'Overview of C++ for OOP', estimatedDurationMinutes: 90 },
        ],
      },
      {
        title: 'Basic Behavioral Modeling',
        summary: 'Use cases, activity diagrams, state diagrams, and interaction diagrams',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Use Case Modeling', estimatedDurationMinutes: 80 },
          { title: 'Use Case Diagrams with UML Notation', estimatedDurationMinutes: 70 },
          { title: 'Use Case Descriptions', estimatedDurationMinutes: 60 },
          { title: 'Activity Diagrams', estimatedDurationMinutes: 75 },
          { title: 'State Diagrams and Swim Lanes', estimatedDurationMinutes: 80 },
          { title: 'Interaction Diagrams', estimatedDurationMinutes: 75 },
          { title: 'Behavioral Patterns', estimatedDurationMinutes: 70 },
          { title: 'Scenario-Based Analysis', estimatedDurationMinutes: 60 },
          { title: 'Verification and Validation of Behavior Models', estimatedDurationMinutes: 80 },
        ],
      },
      {
        title: 'Advanced Behavioral Modeling',
        summary: 'Event-driven architectures, state machines, and business process modeling',
        estimatedDurationMinutes: 600, // 10 hours
        lessons: [
          { title: 'Advanced Use Case Modeling', estimatedDurationMinutes: 65 },
          { title: 'Advanced Activity Diagrams', estimatedDurationMinutes: 60 },
          { title: 'State Machine Diagrams', estimatedDurationMinutes: 75 },
          { title: 'Sequence and Communication Diagrams', estimatedDurationMinutes: 80 },
          { title: 'Event-Driven Architectures', estimatedDurationMinutes: 85 },
          { title: 'State Machines, Processes and Threads', estimatedDurationMinutes: 70 },
          { title: 'Business Process Modeling', estimatedDurationMinutes: 75 },
          { title: 'Modeling Reactive Systems', estimatedDurationMinutes: 70 },
          { title: 'Advanced Behavioral Patterns', estimatedDurationMinutes: 60 },
          { title: 'Case Studies and Practical Applications', estimatedDurationMinutes: 60 },
        ],
      },
      {
        title: 'Advanced Architectural Modeling',
        summary: 'Component diagrams, architectural patterns, DDD, SOA, and cloud architectures',
        estimatedDurationMinutes: 300, // 5 hours
        lessons: [
          { title: 'Component and Deployment Diagrams', estimatedDurationMinutes: 60 },
          { title: 'Architectural Styles and Patterns', estimatedDurationMinutes: 70 },
          { title: 'Domain-Driven Design (DDD)', estimatedDurationMinutes: 50 },
          { title: 'SOA and Event-Driven Architecture', estimatedDurationMinutes: 60 },
          { title: 'Cloud and Serverless Architectures', estimatedDurationMinutes: 60 },
        ],
      },
    ],
  },
  'research-methodology-in-computer-science': {
    modules: [
      {
        title: 'Introduction to Research Problem',
        summary: 'Understanding research problems, identification, and data collection methods',
        estimatedDurationMinutes: 540, // 9 hours
        lessons: [
          { title: 'Meaning and Significance of Research Problems', estimatedDurationMinutes: 70 },
          { title: 'Sources and Identification of Research Problems', estimatedDurationMinutes: 75 },
          { title: 'Criteria for Good Research Problems', estimatedDurationMinutes: 80 },
          { title: 'Defining Scope and Objectives', estimatedDurationMinutes: 85 },
          { title: 'Investigative Approaches for Solutions', estimatedDurationMinutes: 90 },
          { title: 'Data Collection, Analysis, and Interpretation', estimatedDurationMinutes: 140 },
        ],
      },
      {
        title: 'Research Methods in Computing Science',
        summary: 'Proof methods, theoretical models, and performance evaluation',
        estimatedDurationMinutes: 780, // 13 hours
        lessons: [
          { title: 'Dialectic of Research in Computing Science', estimatedDurationMinutes: 80 },
          { title: 'Models of Argument', estimatedDurationMinutes: 70 },
          { title: 'Proof Methods: Demonstration, Empirical, Mathematical', estimatedDurationMinutes: 100 },
          { title: 'Deduction and Induction for Computer Science', estimatedDurationMinutes: 85 },
          { title: 'Theoretical Models and Approaches', estimatedDurationMinutes: 90 },
          { title: 'Algorithmic and Software Engineering Approaches', estimatedDurationMinutes: 95 },
          { title: 'Mathematical Modelling', estimatedDurationMinutes: 110 },
          { title: 'Performance Estimation and Evaluation', estimatedDurationMinutes: 150 },
        ],
      },
      {
        title: 'Ethical Conduct and Literature Studies',
        summary: 'Literature review techniques, plagiarism, and research ethics',
        estimatedDurationMinutes: 480, // 8 hours
        lessons: [
          { title: 'Effective Literature Studies', estimatedDurationMinutes: 120 },
          { title: 'Approaches to Literature Analysis', estimatedDurationMinutes: 100 },
          { title: 'Addressing Plagiarism', estimatedDurationMinutes: 90 },
          { title: 'Research Ethics and Ethical Considerations', estimatedDurationMinutes: 170 },
        ],
      },
      {
        title: 'Technical Writing and Research Proposals',
        summary: 'Technical writing, report writing, and research proposal development',
        estimatedDurationMinutes: 300, // 5 hours
        lessons: [
          { title: 'Effective Technical Writing', estimatedDurationMinutes: 80 },
          { title: 'Report Writing Techniques', estimatedDurationMinutes: 70 },
          { title: 'Developing a Research Proposal', estimatedDurationMinutes: 90 },
          { title: 'Proposal Format and Presentation', estimatedDurationMinutes: 60 },
        ],
      },
      {
        title: 'Intellectual Property and Patents',
        summary: 'Patents, copyrights, patenting process, and international cooperation',
        estimatedDurationMinutes: 300, // 5 hours
        lessons: [
          { title: 'Nature of Intellectual Property', estimatedDurationMinutes: 70 },
          { title: 'Patents, Designs, and Copyrights', estimatedDurationMinutes: 60 },
          { title: 'Patenting Process: Research to Development', estimatedDurationMinutes: 80 },
          { title: 'International Patenting and PCT', estimatedDurationMinutes: 90 },
        ],
      },
      {
        title: 'Patent Rights and IPR Developments',
        summary: 'Patent licensing, technology transfer, and IPR in software',
        estimatedDurationMinutes: 300, // 5 hours
        lessons: [
          { title: 'Scope and Transfer of Patent Rights', estimatedDurationMinutes: 70 },
          { title: 'Licensing and Technology Transfer', estimatedDurationMinutes: 60 },
          { title: 'Patent Information and Databases', estimatedDurationMinutes: 50 },
          { title: 'IPR in Computer Software', estimatedDurationMinutes: 60 },
          { title: 'Case Studies in IPR', estimatedDurationMinutes: 60 },
        ],
      },
    ],
  },
  'probability-entropy-and-monte-carlo-simulation': {
    modules: [
      {
        title: 'Motivation and Probability Fundamentals',
        summary: 'Introduction to randomness, probability models, and Bayes theorem',
        estimatedDurationMinutes: 540, // 9 hours (1 + 8)
        lessons: [
          { title: 'Randomness and Uncertainty', estimatedDurationMinutes: 30 },
          { title: 'Probability Models and Sample Space', estimatedDurationMinutes: 60 },
          { title: 'Axioms of Probability', estimatedDurationMinutes: 55 },
          { title: 'Conditional Probability and Independence', estimatedDurationMinutes: 70 },
          { title: 'Birthday Problem and Fair Coin from Biased Coin', estimatedDurationMinutes: 50 },
          { title: 'Reliability: Series and Parallel Systems', estimatedDurationMinutes: 60 },
          { title: 'Theorem of Total Probability', estimatedDurationMinutes: 55 },
          { title: 'Bayes\' Theorem and Bernoulli Trials', estimatedDurationMinutes: 80 },
          { title: 'Geometric Probability', estimatedDurationMinutes: 80 },
        ],
      },
      {
        title: 'Discrete Random Variables',
        summary: 'PMF, expectation, and special discrete distributions',
        estimatedDurationMinutes: 480, // 8 hours
        lessons: [
          { title: 'Definition and Distribution Function', estimatedDurationMinutes: 60 },
          { title: 'Probability Mass Function', estimatedDurationMinutes: 55 },
          { title: 'Expectation, Mean and Variance', estimatedDurationMinutes: 70 },
          { title: 'Moment Generating Function', estimatedDurationMinutes: 60 },
          { title: 'Bernoulli and Binomial Distributions', estimatedDurationMinutes: 75 },
          { title: 'Poisson and Geometric Distributions', estimatedDurationMinutes: 70 },
          { title: 'Negative Binomial and Hypergeometric', estimatedDurationMinutes: 60 },
          { title: 'Indicator Random Variables', estimatedDurationMinutes: 30 },
        ],
      },
      {
        title: 'Continuous Random Variables',
        summary: 'PDF, special continuous distributions, and limit theorems',
        estimatedDurationMinutes: 540, // 9 hours
        lessons: [
          { title: 'Continuous RV and Distribution Function', estimatedDurationMinutes: 60 },
          { title: 'Probability Density Function', estimatedDurationMinutes: 65 },
          { title: 'Expectation and Variance for Continuous RVs', estimatedDurationMinutes: 60 },
          { title: 'Uniform and Exponential Distributions', estimatedDurationMinutes: 70 },
          { title: 'Gamma and Normal Distributions', estimatedDurationMinutes: 80 },
          { title: 'Pareto and Weibull Distributions', estimatedDurationMinutes: 60 },
          { title: 'Functions of Random Variables', estimatedDurationMinutes: 65 },
          { title: 'Markov and Chebyshev\'s Inequalities', estimatedDurationMinutes: 60 },
          { title: 'Limiting Distributions and Stirling\'s Approximation', estimatedDurationMinutes: 20 },
        ],
      },
      {
        title: 'Jointly Distributed Random Variables',
        summary: 'Joint distributions, covariance, and limit theorems',
        estimatedDurationMinutes: 420, // 7 hours
        lessons: [
          { title: 'Random Vectors and Joint Distribution', estimatedDurationMinutes: 70 },
          { title: 'Independent Random Variables', estimatedDurationMinutes: 60 },
          { title: 'Sum of Independent Random Variables', estimatedDurationMinutes: 55 },
          { title: 'Conditional Distribution and Expectation', estimatedDurationMinutes: 65 },
          { title: 'Covariance and Correlation Coefficient', estimatedDurationMinutes: 60 },
          { title: 'Multivariate Normal Distribution', estimatedDurationMinutes: 50 },
          { title: 'Law of Large Numbers and Central Limit Theorem', estimatedDurationMinutes: 60 },
        ],
      },
      {
        title: 'Monte-Carlo Simulation',
        summary: 'MC methods, random number generation, and simulation techniques',
        estimatedDurationMinutes: 420, // 7 hours
        lessons: [
          { title: 'MC Methods: Sampling and Simulation', estimatedDurationMinutes: 60 },
          { title: 'Estimation of π and Buffon\'s Needle Problem', estimatedDurationMinutes: 70 },
          { title: 'Linear Congruential Methods', estimatedDurationMinutes: 50 },
          { title: 'Inverse Transform and Acceptance-Rejection Method', estimatedDurationMinutes: 75 },
          { title: 'Generating Continuous Random Variables', estimatedDurationMinutes: 65 },
          { title: 'Generating Discrete Random Variables', estimatedDurationMinutes: 50 },
          { title: 'Illustration of CLT and MC Simulation', estimatedDurationMinutes: 50 },
        ],
      },
      {
        title: 'Information Theory and Applications',
        summary: 'Entropy, information theory, and KL divergence',
        estimatedDurationMinutes: 300, // 5 hours
        lessons: [
          { title: 'Overview of Information Theory', estimatedDurationMinutes: 50 },
          { title: 'Information, Surprise and Entropy', estimatedDurationMinutes: 70 },
          { title: 'Properties of Entropy Function', estimatedDurationMinutes: 60 },
          { title: 'Applications of Entropy', estimatedDurationMinutes: 70 },
          { title: 'Kullback-Leibler Measure of Divergence', estimatedDurationMinutes: 50 },
        ],
      },
    ],
  },
};

async function run() {
  await connectToDatabase();

  console.log('Starting course modules and lessons seeding...\n');

  let totalModulesCreated = 0;
  let totalLessonsCreated = 0;

  for (const [courseSlug, courseData] of Object.entries(coursesData)) {
    console.log(`\n📚 Processing course: ${courseSlug}`);

    // Find the course
    const course = await CourseModel.findOne({ slug: courseSlug });
    if (!course) {
      console.log(`   ❌ Course not found: ${courseSlug}`);
      continue;
    }

    console.log(`   ✓ Found course: ${course.title}`);

    // Clear existing modules and lessons for this course
    await CourseLessonModel.deleteMany({ courseId: course._id });
    await CourseModuleModel.deleteMany({ courseId: course._id });
    console.log(`   🗑️  Cleared existing modules and lessons`);

    // Create modules and lessons
    for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
      const moduleData = courseData.modules[moduleIndex];

      // Create the module
      const module = await CourseModuleModel.create({
        courseId: course._id,
        title: moduleData.title,
        summary: moduleData.summary,
        order: moduleIndex,
        estimatedDurationMinutes: moduleData.estimatedDurationMinutes,
        lessonIds: [],
        flashcardDeckIds: [],
      });

      totalModulesCreated++;
      console.log(`      ✓ Module ${moduleIndex + 1}: ${moduleData.title}`);

      // Create lessons for this module
      const lessonIds: any[] = [];
      for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
        const lessonData = moduleData.lessons[lessonIndex];

        const lesson = await CourseLessonModel.create({
          courseId: course._id,
          moduleId: module._id,
          title: lessonData.title,
          contentType: 'standalone', // Default to standalone, can be changed later
          standaloneContent: `# ${lessonData.title}\n\nLesson content will be added here.`,
          standaloneFormat: 'mdx',
          estimatedDurationMinutes: lessonData.estimatedDurationMinutes,
          isPreviewable: lessonIndex === 0, // First lesson is previewable
          progressWeight: 1,
          prerequisiteLessonIds: [],
          flashcardDeckIds: [],
        });

        lessonIds.push(lesson._id);
        totalLessonsCreated++;
        console.log(`         • Lesson ${lessonIndex + 1}: ${lessonData.title}`);
      }

      // Update module with lesson IDs
      module.lessonIds = lessonIds;
      await module.save();
    }

    // Update course lesson count
    const totalLessons = courseData.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    );
    course.lessonCount = totalLessons;
    await course.save();

    console.log(`   ✅ Course updated with ${totalLessons} lessons`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seeding Complete!');
  console.log('='.repeat(60));
  console.log(`Total Modules Created: ${totalModulesCreated}`);
  console.log(`Total Lessons Created: ${totalLessonsCreated}`);
  console.log('='.repeat(60));

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
