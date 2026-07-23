export const LOCATIONS = ['All Locations', 'Remote', 'Bengaluru', 'Delhi NCR', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai'];
export const WORK_MODES = ['All Modes', 'Remote', 'In-office', 'Hybrid'];
export const ROLE_CATEGORIES = ['All Categories', 'Software Engineering', 'UI/UX & Product Design', 'Digital Marketing', 'Content & Copywriting', 'Sales & Business Development', 'Data & Analytics'];
export const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'Tailwind CSS', 'Figma', 'SEO', 'JavaScript', 'Copywriting', 'Graphic Design', 'SQL'];

export const INITIAL_MOCK_USERS = {
  'worker_demo_1': {
    uid: 'worker_demo_1',
    role: 'worker',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@example.com',
    location: 'Bengaluru',
    bio: 'CS Undergrad & passionate Full Stack Developer. Looking for flexible gigs, internships, and full-time remote/hybrid roles.',
    skillScore: 88,
    skills: [
      { name: 'React', score: 92, verified: true },
      { name: 'Node.js', score: 85, verified: true },
      { name: 'Tailwind CSS', score: 87, verified: true },
      { name: 'JavaScript', score: 90, verified: true }
    ],
    createdAt: new Date().toISOString()
  },
  'employer_demo_1': {
    uid: 'employer_demo_1',
    role: 'employer',
    name: 'TechCorp Solutions',
    mobile: '9123456789',
    email: 'hiring@techcorp.io',
    location: 'Bengaluru',
    bio: 'Leading innovator in web software & AI products hiring top student & workforce talent.',
    skillScore: 0,
    skills: [],
    createdAt: new Date().toISOString()
  }
};

export const INITIAL_MOCK_JOBS = [
  {
    id: 'job_demo_1',
    employerId: 'employer_demo_1',
    title: 'React Frontend Developer',
    type: 'Gig',
    pay: '₹800/hr',
    location: 'Remote',
    workMode: 'Remote',
    roleCategory: 'Software Engineering',
    skills: ['React', 'JavaScript', 'Tailwind CSS'],
    description: 'Looking for a skilled React developer to build dynamic UI components for an e-commerce analytics dashboard. Flexible hours, fully remote.',
    hiringProcess: ['Application', 'Technical Test', 'Interview', 'Hired'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_demo_2',
    employerId: 'employer_demo_1',
    title: 'Social Media Marketing Specialist',
    type: 'Internship',
    pay: '₹18,000/month',
    location: 'Mumbai',
    workMode: 'Hybrid',
    roleCategory: 'Digital Marketing',
    skills: ['SEO', 'Copywriting', 'Graphic Design'],
    description: 'Manage creative posts, Instagram reels, and campus ambassador outreach for our upcoming SaaS product launch in Mumbai.',
    hiringProcess: ['Application', 'Interview', 'Hired'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_demo_3',
    employerId: 'employer_demo_1',
    title: 'Junior Full Stack Engineer',
    type: 'Job',
    pay: '₹8,50,000/yr',
    location: 'Bengaluru',
    workMode: 'In-office',
    roleCategory: 'Software Engineering',
    skills: ['React', 'Node.js', 'Python', 'SQL'],
    description: 'Full-time junior developer position working with Node.js, React, and PostgreSQL. Open to fresh graduates with strong project portfolios.',
    hiringProcess: ['Application', 'Screening', 'Technical Round', 'HR Round', 'Hired'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_demo_4',
    employerId: 'employer_demo_1',
    title: 'UI/UX Product Designer',
    type: 'Gig',
    pay: '₹1,200/hr',
    location: 'Delhi NCR',
    workMode: 'Remote',
    roleCategory: 'UI/UX & Product Design',
    skills: ['Figma', 'Graphic Design'],
    description: 'Design mobile-first wireframes, high-fidelity prototypes, and design systems for a fintech mobile app project.',
    hiringProcess: ['Application', 'Portfolio Review', 'Interview', 'Hired'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job_demo_5',
    employerId: 'employer_demo_1',
    title: 'Python Data Analyst Intern',
    type: 'Internship',
    pay: '₹22,000/month',
    location: 'Hyderabad',
    workMode: 'Hybrid',
    roleCategory: 'Data & Analytics',
    skills: ['Python', 'SQL'],
    description: 'Analyze user behavior data, build automated reporting scripts using Pandas/SQL, and prepare executive dashboards.',
    hiringProcess: ['Application', 'Coding Challenge', 'Hired'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MOCK_APPLICATIONS = [
  {
    id: 'app_demo_1',
    jobId: 'job_demo_1',
    workerId: 'worker_demo_1',
    status: 'Technical Test',
    timestamp: new Date().toISOString()
  },
  {
    id: 'app_demo_2',
    jobId: 'job_demo_2',
    workerId: 'worker_demo_1',
    status: 'Applied',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'worker_demo_1',
    type: 'status_change',
    message: 'Your application for React Frontend Developer has been moved to: Technical Test',
    jobId: 'job_demo_1',
    read: false,
    timestamp: new Date().toISOString()
  }
];
