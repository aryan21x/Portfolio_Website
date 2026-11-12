import eliteRecruit from '../assets/img/EliteRecruit.png';
import nanoafm from '../assets/img/nanoafm.png';

export const projectCategories = [
  { id: 'all', label: 'All projects' },
  { id: 'full-stack', label: 'Web & mobile' },
  { id: 'ml', label: 'Machine learning' },
  { id: 'systems', label: 'Systems & research' },
];

export const projects = [
  {
    id: 'nanoafm',
    title: 'NanoAFM',
    category: 'systems',
    categoryLabel: 'Research · Interactive 3D',
    description: 'A 3D Atomic Force Microscope website I built during my research at South Dakota Mines. You can explore the instrument, open its components, and see how nanoscale scanning produces an image.',
    tags: ['React', 'Three.js', 'Blender'],
    image: nanoafm,
    live: 'https://nanoafm.netlify.app/',
  },
  {
    id: 'fraud-detection',
    title: 'Machine Learning Fraud Detection',
    category: 'ml',
    categoryLabel: 'Machine learning',
    description: 'A Python pipeline for fraud classification using 590K payment transactions. It joins transaction and identity data, prepares chronological train/validation/test splits, selects thresholds, and compares Logistic Regression, Random Forest, and XGBoost.',
    tags: ['Python', 'Pandas', 'NumPy', 'scikit-learn', 'XGBoost'],
    source: 'https://github.com/aryan21x/Machine-Learning-Fraud-Detection',
  },
  {
    id: 'degree-planner',
    title: 'Degree Planner',
    category: 'full-stack',
    categoryLabel: 'Senior design · Full stack',
    description: 'A degree-planning app that checks prerequisites, corequisites, and semester course offerings. I built the React Flow interface and Express/MongoDB APIs with Azure AD authentication and role-based access, and deployed the app on Linux with Nginx and PM2.',
    tags: ['React', 'TypeScript', 'Express', 'MongoDB', 'Azure AD'],
  },
  {
    id: 'sidehustle',
    title: 'SideHustle',
    category: 'full-stack',
    categoryLabel: 'Hackathon · Mobile app',
    description: 'A gig marketplace built with React Native and Expo, with swipe matching and Google sign-in. Firebase syncs listings, matches, and chats in real time. LLM-generated profiles and cached recommendations rank gigs by skills, location, and engagement, with an API fallback. Virtual credits unlock chats and boost listings, alongside AI moderation and rule-based safety checks.',
    tags: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'OpenAI API'],
    source: 'https://github.com/aryan21x/Hackathon',
  },
  {
    id: 'pca-lda',
    title: 'PCA & LDA Image Classification',
    category: 'ml',
    categoryLabel: 'Machine learning',
    description: 'I implemented PCA and Linear Discriminant Analysis from scratch with NumPy and Pandas. The project uses image vectorization, data centering, dimensionality reduction, nearest neighbor pose estimation, and subspace learning to classify Boat images and MNIST digits and compare class separation.',
    tags: ['Python', 'NumPy', 'Pandas', 'PCA / LDA'],
    source: 'https://github.com/aryan21x/Machine-Learning-Projects',
  },
  {
    id: 'mines-shell',
    title: 'Mines Shell',
    category: 'systems',
    categoryLabel: 'Systems · Unix/Linux',
    description: 'A Unix-style shell I wrote in C++. It supports child processes, pipelines, I/O redirection, background jobs, and batch files, along with cd, exit, and environment assignments. Grammar-based parsing checks command syntax and handles errors.',
    tags: ['C++', 'Unix/Linux', 'Processes', 'Parsing'],
    source: 'https://github.com/aryan21x/Mines-Shell',
  },
  {
    id: 'memory-simulator',
    title: 'Memory Simulator',
    category: 'systems',
    categoryLabel: 'Systems · Memory management',
    description: 'A Python simulator for variable-sized partitioning, paging, and segmentation. It models process arrivals and completions from workload files, implements first-fit, best-fit, and worst-fit allocation, prints real-time memory maps, and tracks process turnaround times.',
    tags: ['Python', 'Memory allocation', 'Operating systems'],
    source: 'https://github.com/aryan21x/Memory-Simulator',
  },
  {
    id: 'elite-recruit',
    title: 'EliteRecruit',
    category: 'full-stack',
    categoryLabel: 'Full stack',
    description: 'A team project built with ASP.NET Core MVC. Recruiters can browse student records, search, sort, filter, and manage entries through CRUD workflows.',
    tags: ['ASP.NET Core', 'C#', 'Bootstrap'],
    image: eliteRecruit,
    source: 'https://github.com/aryan21x/Recruting-Website',
  },
  {
    id: 'ppm-terminal',
    title: 'PPM Images in the Terminal',
    category: 'systems',
    categoryLabel: 'Systems · ARM Assembly',
    description: 'An ARM Assembly and C program that reads PPM files and prints black-and-white images in the terminal using ASCII characters.',
    tags: ['ARM Assembly', 'C', 'Image processing'],
    source: 'https://github.com/aryan21x/Printing-PPM-Image-on-Terminal',
  },
];

export const experiences = [
  {
    company: 'C-lock Inc.',
    logo: '/logos/c-lock-icon.png',
    role: 'Software Engineer',
    dates: 'Dec 2025 — Nov 2026',
    location: 'Rapid City, South Dakota',
    highlights: [
      'Maintained an R-based anomaly detection script monitoring 10,000+ IoT devices, applying statistical methods to gas, proximity, RFID, and load-cell sensor data to flag drift and hardware failures for daily engineering review.',
      'Optimized baseline algorithm that tracks feed consumption across 1,000+ IoT devices using rolling medians and variance masking to filter animal induced weight fluctuations and track refill events.',
      'Built a PHP experiment scheduling platform serving 1,000+ customers; migrated legacy Salesforce records and integrated RBAC REST APIs, ClickUp automation, and vision LLM image analysis.',
      'Secured PHP REST APIs with IP-based rate limiting, brute-force lockouts, and standardized JSON responses; built an MCP server integrating these APIs for AI-driven device queries and diagnostics.',
    ],
    tags: ['PHP', 'R', 'REST APIs', 'Database', 'SQL', 'MCP'],
  },
  {
    company: 'Caterpillar',
    logo: '/logos/caterpillar.svg',
    role: 'Software Development Intern',
    dates: 'Jan 2025 — May 2026',
    location: 'South Dakota Mines',
    highlights: [
      'Enhanced a Next.js full-stack platform on Azure used by Caterpillar employees worldwide; implemented RBAC via Azure AD and integrated internal databases through REST APIs secured with OAuth 2.0 client credentials.',
      'Managed Azure development, QA, and production environments, configuring secure database connectivity and secret management with Azure Managed Identity and Key Vault.',
      'Coordinated weekly with stakeholders to deliver features, modernized UI/UX, moved the application to a public facing domain, and integrated SendGrid for automated notifications.',
    ],
    tags: ['Next.js', 'Azure', 'Tailwind CSS', 'SSMS', 'Docker'],
  },
  {
    company: 'South Dakota Mines',
    logo: '/logos/south-dakota-mines.png',
    role: 'Undergraduate Research Intern',
    dates: 'Nov 2024 — Nov 2025',
    location: 'South Dakota Mines',
    highlights: [
      'Researched on Transmission Electron Microscopy (TEM) image analysis in Python using OpenCV and K means clustering to denoise grayscale micrographs, segment nanoparticles from the background, and automate particle sampling.',
      'Built an interactive 3D Atomic Force Microscope (AFM) educational platform using React, Three.js, and Blender, with component exploration, animated nanoscale scanning, and simulated image formation (nanoafm.netlify.app).',
    ],
    tags: ['Python', 'OpenCV', 'React', 'Three.js', 'Blender'],
  },
];

export const skillGroups = [
  {
    id: 'development',
    title: 'Web & mobile development',
    skills: [
      ['React', 'react'], ['Next.js', 'nextjs'], ['TypeScript', 'typescript'],
      ['JavaScript', 'javascript'], ['PHP', 'php'], ['Express', 'express'],
      ['Node.js', 'nodejs'], ['Django', 'django'], ['ASP.NET', 'dotnetcore'],
      ['Tailwind CSS', 'tailwindcss'], ['React Native', 'react'], ['Expo', null, 'EX'],
    ],
  },
  {
    id: 'machine-learning',
    title: 'Machine learning & data',
    skills: [
      ['Python', 'python'], ['NumPy', 'numpy'], ['Pandas', 'pandas'],
      ['scikit-learn', 'scikitlearn'], ['XGBoost', null, 'XGB'],
      ['OpenCV', 'opencv'], ['R', 'r'], ['SQL', 'azuresqldatabase'], ['OpenAI API', null, 'API'],
    ],
  },
  {
    id: 'platforms',
    title: 'Cloud & engineering tools',
    skills: [
      ['Azure', 'azure'], ['Docker', 'docker'], ['Nginx', 'nginx'],
      ['MongoDB', 'mongodb'], ['GitHub', 'github'], ['GitLab', 'gitlab'],
      ['Firebase', 'firebase'], ['SSMS', 'microsoftsqlserver'],
      ['Power BI', null, 'BI'],
    ],
  },
  {
    id: 'systems',
    title: 'Systems & visualization',
    skills: [
      ['C++', 'cplusplus'], ['C#', 'csharp'], ['ARM Assembly', null, 'ARM'],
      ['Three.js', 'threejs'], ['Blender', 'blender'], ['Unix/Linux', null, 'LIN'],
    ],
  },
];
