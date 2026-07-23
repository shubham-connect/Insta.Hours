import { INITIAL_MOCK_USERS, INITIAL_MOCK_JOBS, INITIAL_MOCK_APPLICATIONS, INITIAL_MOCK_NOTIFICATIONS } from './mockData';

class DemoStore {
  constructor() {
    this.listeners = new Set();
    
    // Load from localStorage or use defaults
    const savedUsers = localStorage.getItem('instahours_users');
    const savedJobs = localStorage.getItem('instahours_jobs');
    const savedApps = localStorage.getItem('instahours_applications');
    const savedNotifs = localStorage.getItem('instahours_notifications');
    const savedCurrentUser = localStorage.getItem('instahours_current_user');

    this.users = savedUsers ? JSON.parse(savedUsers) : INITIAL_MOCK_USERS;
    this.jobs = savedJobs ? JSON.parse(savedJobs) : INITIAL_MOCK_JOBS;
    this.applications = savedApps ? JSON.parse(savedApps) : INITIAL_MOCK_APPLICATIONS;
    this.notifications = savedNotifs ? JSON.parse(savedNotifs) : INITIAL_MOCK_NOTIFICATIONS;
    this.currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
  }

  save() {
    localStorage.setItem('instahours_users', JSON.stringify(this.users));
    localStorage.setItem('instahours_jobs', JSON.stringify(this.jobs));
    localStorage.setItem('instahours_applications', JSON.stringify(this.applications));
    localStorage.setItem('instahours_notifications', JSON.stringify(this.notifications));
    if (this.currentUser) {
      localStorage.setItem('instahours_current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('instahours_current_user');
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb());
  }

  // Auth operations
  loginAsDemoWorker() {
    this.currentUser = this.users['worker_demo_1'];
    this.save();
    return this.currentUser;
  }

  loginAsDemoEmployer() {
    this.currentUser = this.users['employer_demo_1'];
    this.save();
    return this.currentUser;
  }

  loginWithPhone(mobile) {
    // Find existing user by mobile or create dummy
    const existing = Object.values(this.users).find(u => u.mobile === mobile);
    if (existing) {
      this.currentUser = existing;
    } else {
      const uid = 'user_' + Date.now();
      this.currentUser = { uid, mobile, name: '', email: '', role: '', bio: '', skillScore: 0, skills: [] };
    }
    this.save();
    return this.currentUser;
  }

  createUserProfile(uid, profileData) {
    const userDoc = {
      uid,
      ...profileData,
      createdAt: new Date().toISOString()
    };
    this.users[uid] = userDoc;
    this.currentUser = userDoc;
    this.save();
    return userDoc;
  }

  updateUserProfile(uid, updates) {
    if (this.users[uid]) {
      this.users[uid] = { ...this.users[uid], ...updates };
      if (this.currentUser && this.currentUser.uid === uid) {
        this.currentUser = this.users[uid];
      }
      this.save();
    }
  }

  signOut() {
    this.currentUser = null;
    this.save();
  }

  // Jobs operations
  getJobs() {
    return this.jobs;
  }

  addJob(jobData) {
    const newJob = {
      id: 'job_' + Date.now(),
      ...jobData,
      createdAt: new Date().toISOString()
    };
    this.jobs.unshift(newJob);
    this.save();
    return newJob;
  }

  toggleJobActive(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.isActive = !job.isActive;
      this.save();
    }
  }

  // Applications operations
  getApplications() {
    return this.applications;
  }

  applyForJob(jobId, workerId) {
    const newApp = {
      id: 'app_' + Date.now(),
      jobId,
      workerId,
      status: 'Applied',
      timestamp: new Date().toISOString()
    };
    this.applications.unshift(newApp);

    // Create notification for employer
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      this.addNotification({
        userId: job.employerId,
        type: 'new_application',
        message: `New application received for ${job.title}`,
        jobId,
        read: false
      });
    }

    this.save();
    return newApp;
  }

  updateApplicationStatus(appId, newStatus) {
    const app = this.applications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      
      const job = this.jobs.find(j => j.id === app.jobId);
      const jobTitle = job ? job.title : 'the position';

      // Create notification for worker
      this.addNotification({
        userId: app.workerId,
        type: 'status_change',
        message: `Your application for ${jobTitle} has been updated to: ${newStatus}`,
        jobId: app.jobId,
        read: false
      });

      this.save();
    }
  }

  // Notifications operations
  getNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId);
  }

  addNotification(notif) {
    const newNotif = {
      id: 'notif_' + Date.now(),
      ...notif,
      timestamp: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.save();
  }

  markNotificationRead(notifId) {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }
}

export const demoStore = new DemoStore();
