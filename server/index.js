import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Initial DB seed data
const initialDb = {
  users: {
    'worker_demo_1': {
      uid: 'worker_demo_1',
      role: 'worker',
      name: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul.sharma@example.com',
      location: 'Bengaluru',
      bio: 'CS Undergrad & Full Stack Developer. Looking for gigs & full-time roles.',
      skillScore: 88,
      skills: [
        { name: 'React', score: 92, verified: true },
        { name: 'Node.js', score: 85, verified: true },
        { name: 'Tailwind CSS', score: 87, verified: true }
      ]
    },
    'employer_demo_1': {
      uid: 'employer_demo_1',
      role: 'employer',
      name: 'TechCorp Solutions',
      mobile: '9123456789',
      email: 'hiring@techcorp.io',
      location: 'Bengaluru',
      bio: 'Fast growing tech startup hiring student talent.',
      skillScore: 0,
      skills: []
    }
  },
  jobs: [
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
      description: 'Looking for a React developer to build dynamic UI components for an e-commerce dashboard. Flexible hours.',
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
      description: 'Manage creative posts, reels, and campus ambassador outreach for our upcoming product launch.',
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
      description: 'Full-time junior developer working with Node.js and React. Open to fresh graduates.',
      hiringProcess: ['Application', 'Screening', 'Technical Round', 'HR Round', 'Hired'],
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  applications: [
    {
      id: 'app_demo_1',
      jobId: 'job_demo_1',
      workerId: 'worker_demo_1',
      status: 'Technical Test',
      timestamp: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      userId: 'worker_demo_1',
      type: 'status_change',
      message: 'Your application for React Frontend Developer has been updated to: Technical Test',
      jobId: 'job_demo_1',
      read: false,
      timestamp: new Date().toISOString()
    }
  ]
};

// Read / Write helper
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return initialDb;
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Jobs API
app.get('/api/jobs', (req, res) => {
  const dbData = loadDb();
  res.json(dbData.jobs);
});

app.post('/api/jobs', (req, res) => {
  const dbData = loadDb();
  const newJob = {
    id: 'job_' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  dbData.jobs.unshift(newJob);
  saveDb(dbData);
  res.status(201).json(newJob);
});

app.patch('/api/jobs/:id/toggle', (req, res) => {
  const dbData = loadDb();
  const job = dbData.jobs.find(j => j.id === req.params.id);
  if (job) {
    job.isActive = !job.isActive;
    saveDb(dbData);
    res.json(job);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

// Applications API
app.get('/api/applications', (req, res) => {
  const dbData = loadDb();
  res.json(dbData.applications);
});

app.post('/api/applications', (req, res) => {
  const dbData = loadDb();
  const { jobId, workerId } = req.body;
  
  const newApp = {
    id: 'app_' + Date.now(),
    jobId,
    workerId,
    status: 'Applied',
    timestamp: new Date().toISOString()
  };
  dbData.applications.unshift(newApp);

  // Notify employer
  const job = dbData.jobs.find(j => j.id === jobId);
  if (job) {
    dbData.notifications.unshift({
      id: 'notif_' + Date.now(),
      userId: job.employerId,
      type: 'new_application',
      message: `New application received for ${job.title}`,
      jobId,
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  saveDb(dbData);
  res.status(201).json(newApp);
});

app.patch('/api/applications/:id/status', (req, res) => {
  const dbData = loadDb();
  const { status } = req.body;
  const appItem = dbData.applications.find(a => a.id === req.params.id);
  if (appItem) {
    appItem.status = status;

    const job = dbData.jobs.find(j => j.id === appItem.jobId);
    dbData.notifications.unshift({
      id: 'notif_' + Date.now(),
      userId: appItem.workerId,
      type: 'status_change',
      message: `Your application for ${job ? job.title : 'the position'} has been updated to: ${status}`,
      jobId: appItem.jobId,
      read: false,
      timestamp: new Date().toISOString()
    });

    saveDb(dbData);
    res.json(appItem);
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

// Users API
app.get('/api/users/:uid', (req, res) => {
  const dbData = loadDb();
  const user = dbData.users[req.params.uid];
  if (user) res.json(user);
  else res.status(404).json({ error: 'User not found' });
});

app.patch('/api/users/:uid', (req, res) => {
  const dbData = loadDb();
  if (dbData.users[req.params.uid]) {
    dbData.users[req.params.uid] = { ...dbData.users[req.params.uid], ...req.body };
    saveDb(dbData);
    res.json(dbData.users[req.params.uid]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Notifications API
app.get('/api/notifications/:userId', (req, res) => {
  const dbData = loadDb();
  const notifs = dbData.notifications.filter(n => n.userId === req.params.userId);
  res.json(notifs);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const dbData = loadDb();
  const notif = dbData.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveDb(dbData);
    res.json(notif);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

app.listen(PORT, () => {
  console.log(`InstaHours Backend Server running on http://localhost:${PORT}`);
});
