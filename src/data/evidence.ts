export type EvidenceItem = {
  repo: string;
  title: string;
  url: string;
  points: string[];
};

export type EvidenceCategory = {
  key: string;
  label: string;
  items: EvidenceItem[];
};

export const evidenceCategories: EvidenceCategory[] = [
  {
    key: 'security',
    label: 'Cybersecurity Engineer',
    items: [
      {
        repo: 'second_brain_database',
        title: 'Security Implementation',
        url: 'https://github.com/rohanbatrain/second_brain_database/blob/main/src/second_brain_database/main.py',
        points: ['IP blocking', 'Rate limiting', 'JWT authentication'],
      },
      {
        repo: 'emotion_tracker',
        title: 'Mobile Security',
        url: 'https://github.com/rohanbatrain/emotion_tracker',
        points: ['Biometric auth', 'Two-factor authentication flows'],
      },
      {
        repo: 'sbd_sso',
        title: 'Single Sign-On',
        url: 'https://github.com/rohanbatrain/sbd_sso',
        points: ['SSO integration', 'Centralized auth service'],
      },
    ],
  },
  {
    key: 'full-stack',
    label: 'Full Stack Developer',
    items: [
      {
        repo: 'second_brain_database',
        title: 'Flask API + MongoDB',
        url: 'https://github.com/rohanbatrain/second_brain_database',
        points: ['Production API', '186+ commits'],
      },
      {
        repo: 'emotion_tracker',
        title: 'Flutter Frontend',
        url: 'https://github.com/rohanbatrain/emotion_tracker',
        points: ['173+ commits', '3 releases'],
      },
      {
        repo: 'rohan_batra',
        title: 'Portfolio Application',
        url: 'https://github.com/rohanbatrain/rohan_batra',
        points: ['Next.js + TypeScript', 'Admin CMS + Blog'],
      },
      {
        repo: 'blog',
        title: 'Web Frontend',
        url: 'https://github.com/rohanbatrain/blog',
        points: ['Custom features', 'Modern UI'],
      },
      {
        repo: 'second_brain_database_flutter_frontend',
        title: 'Frontend Integration',
        url: 'https://github.com/rohanbatrain/second_brain_database_flutter_frontend',
        points: ['Enterprise Flutter client'],
      },
    ],
  },
  {
    key: 'mobile',
    label: 'Flutter Developer',
    items: [
      {
        repo: 'emotion_tracker',
        title: 'Multi-platform App',
        url: 'https://github.com/rohanbatrain/emotion_tracker',
        points: ['6-platform deployment', 'Advanced features'],
      },
      { repo: 'rohan_batra', title: 'Portfolio Flutter', url: 'https://github.com/rohanbatrain/rohan_batra', points: ['Mobile portfolio app'] },
      { repo: 'sbd_flutter_template', title: 'Flutter Template', url: 'https://github.com/rohanbatrain/sbd_flutter_template', points: ['Starter template'] },
      {
        repo: 'second_brain_database_flutter_frontend',
        title: 'Flutter Frontend',
        url: 'https://github.com/rohanbatrain/second_brain_database_flutter_frontend',
        points: ['Enterprise-grade client'],
      },
    ],
  },
  {
    key: 'devops',
    label: 'DevOps Engineer',
    items: [
      { repo: 'second_brain_database', title: 'Docker Orchestration', url: 'https://github.com/rohanbatrain/second_brain_database/blob/main/docker-compose.yml', points: ['Compose orchestration'] },
      { repo: 'proxmox-auto-install-assistant-docker', title: 'Containerization', url: 'https://github.com/rohanbatrain/proxmox-auto-install-assistant-docker', points: ['Cross-platform containers'] },
      { repo: 'gh-experiments', title: 'GitHub Actions', url: 'https://github.com/rohanbatrain/gh-experiments', points: ['CI/CD pipelines'] },
      { repo: 'docker-compose-setup', title: 'IaC', url: 'https://github.com/rohanbatrain/docker-compose-setup', points: ['Infrastructure as code'] },
      { repo: 'scripts', title: 'Automation', url: 'https://github.com/rohanbatrain/scripts', points: ['Automation frameworks'] },
    ],
  },
  {
    key: 'python',
    label: 'Python Backend Developer',
    items: [
      { repo: 'second_brain_database', title: 'Production Flask API', url: 'https://github.com/rohanbatrain/second_brain_database/tree/main/src', points: ['Scalable modules'] },
      { repo: 'MarkLang', title: 'CLI Tool', url: 'https://github.com/rohanbatrain/MarkLang', points: ['Google Translate API'] },
      { repo: 'second-brain-tools-2022', title: 'PyPI Package', url: 'https://github.com/rohanbatrain/second-brain-tools-2022', points: ['Package distribution'] },
      { repo: 'ollama-gh-action', title: 'GitHub Action', url: 'https://github.com/rohanbatrain/ollama-gh-action', points: ['Python action'] },
      { repo: 'sbdfs', title: 'FUSE Filesystem', url: 'https://github.com/rohanbatrain/sbdfs', points: ['Filesystem implementation'] },
    ],
  },
  {
    key: 'android',
    label: 'Android Systems Developer',
    items: [
      { repo: 'Karmstrot-Builds', title: 'KernelSU Builds', url: 'https://github.com/rohanbatrain/Karmstrot-Builds', points: ['OnePlus builds'] },
      { repo: 'android_kernel_oneplus_sm8250', title: 'Kernel Fork', url: 'https://github.com/rohanbatrain/android_kernel_oneplus_sm8250', points: ['LineageOS kernel'] },
      { repo: 'kernel_oneplus_sm8250', title: 'AOSP Kernel', url: 'https://github.com/rohanbatrain/kernel_oneplus_sm8250', points: ['AOSP implementation'] },
      { repo: 'Anomaly-Kernel', title: 'Gaming Kernel', url: 'https://github.com/rohanbatrain/Anomaly-Kernel', points: ['Gaming optimized'] },
      { repo: 'KernelSU', title: 'Root Framework', url: 'https://github.com/rohanbatrain/KernelSU', points: ['Root management'] },
      { repo: 'device_oneplus_opkona', title: 'Recovery', url: 'https://github.com/rohanbatrain/device_oneplus_opkona', points: ['OrangeFox recovery'] },
      { repo: 'AnyKernel3-SM8250', title: 'Flashing', url: 'https://github.com/rohanbatrain/AnyKernel3-SM8250', points: ['Universal flashing'] },
      { repo: 'po_kernel_oneplus_sm8250', title: 'Dependencies', url: 'https://github.com/rohanbatrain/po_kernel_oneplus_sm8250', points: ['Device deps'] },
    ],
  },
];
