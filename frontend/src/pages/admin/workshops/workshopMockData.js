// Mock data + UI-only helpers for Workshop Management (Phase 1)

export const AI_BOOTUP_DEFAULT = {
  title: 'AI Boot-Up by Younovate',
  tagline: 'Learn Smarter. Build Fast.',
  subTheme: 'Prompt Smarter. Learn Faster. Build Better.',
};

export const WORKSHOP_CATEGORIES = ['Workshop'];
export const WORKSHOP_MODES = ['Online', 'Offline', 'Hybrid'];
export const WORKSHOP_BILLING = ['Free', 'Paid'];
export const WORKSHOP_LANGUAGES = ['English', 'Tamil', 'Hindi'];

export const DEFAULT_SPEAKERS = [
  {
    name: 'Neha',
    photo: '',
    designation: 'AI Mentor',
    bio: 'Neha helps learners unlock AI for real-world student productivity.',
    linkedIn: '',
    timing: { module: 'Module 1', durationMinutes: 30 },
  },
  {
    name: 'Prithika',
    photo: '',
    designation: 'Prompt Engineer',
    bio: 'Prithika teaches prompt engineering and AI assisted coding workflows.',
    linkedIn: '',
    timing: { module: 'Module 2', durationMinutes: 30 },
  },
  {
    name: 'Bindu',
    photo: '',
    designation: 'Career Coach',
    bio: 'Bindu builds confidence for career growth using AI frameworks.',
    linkedIn: '',
    timing: { module: 'Module 3', durationMinutes: 30 },
  },
  {
    name: 'Host',
    photo: '',
    designation: 'Workshop Host',
    bio: 'Guides the sessions and manages the event flow.',
    linkedIn: '',
    timing: { module: 'Module 4', durationMinutes: 10 },
  },
];

export const AI_BOOTUP_MODULE_BUILDER = [
  {
    moduleId: 'module-1',
    title: 'AI for Student Productivity',
    durationMinutes: 30,
    topics: [
      'Welcome',
      'Audience Connection',
      'Importance of AI',
      'Explain Difficult Topics',
      'Revision Notes',
      'Study Planner',
      'Google Sheets AI',
      'Prompt Examples',
      'Downloads',
      'Closing',
    ],
  },
  {
    moduleId: 'module-2',
    title: 'Prompt Engineering & AI Assisted Coding',
    durationMinutes: 30,
    topics: [
      'Introduction',
      'Prompt Engineering',
      'Weak Prompt',
      'Strong Prompt',
      'Context',
      'Task',
      'Output Framework',
      'Coding with AI',
      'Bug Fixing',
      'Code Explanation',
      'AI Beyond ChatGPT',
      'Smart AI Usage',
      'Summary',
    ],
  },
  {
    moduleId: 'module-3',
    title: 'AI for Career Growth & Confidence',
    durationMinutes: 30,
    topics: [
      'Bridge',
      'Career Growth',
      'Interview Coach',
      'LinkedIn Profile',
      'Career Roadmap',
      '7 Day AI Challenge',
      'Audience Challenge',
      'Closing',
    ],
  },
  {
    moduleId: 'module-4',
    title: 'Choose Your AI Path',
    durationMinutes: 10,
    topics: [
      'YIEP',
      'YBLP',
      'Career Counselling',
      'Future Workshops',
      'Lead Capture',
    ],
  },
];

const now = new Date();
const iso = (d) => d.toISOString();
const daysFromNow = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
};

export const WORKSHOPS_MOCK = [
  {
    id: 'w-1',
    name: 'AI Boot-Up by Younovate',
    category: 'Workshop',
    mode: 'Online',
    date: iso(daysFromNow(-2)),
    time: '10:00 AM',
    durationMinutes: 100,
    seats: 120,
    registeredStudents: 108,
    trainer: 'Younovate Team',
    status: 'Completed',
    billing: 'Free',
    registrationDeadline: iso(daysFromNow(-7)),
    mainWorkshopMinutes: 90,
    softPromotionMinutes: 10,
    totalEventMinutes: 100,
    banner: '',
    thumbnail: '',
    description: 'A live workshop/event that helps learners adopt AI for productivity, prompt engineering, and career growth.',
  },
  {
    id: 'w-2',
    name: 'Productivity with AI (Live)',
    category: 'Workshop',
    mode: 'Hybrid',
    date: iso(daysFromNow(1)),
    time: '3:00 PM',
    durationMinutes: 100,
    seats: 80,
    registeredStudents: 52,
    trainer: 'Neha',
    status: 'Upcoming',
    billing: 'Paid',
    registrationDeadline: iso(daysFromNow(-1)),
    mainWorkshopMinutes: 90,
    softPromotionMinutes: 10,
    totalEventMinutes: 100,
    banner: '',
    thumbnail: '',
    description: 'A fast-paced AI boot-up session focused on study planning and AI-assisted learning.',
  },
  {
    id: 'w-3',
    name: 'Prompt to Code (Live)',
    category: 'Workshop',
    mode: 'Online',
    date: iso(daysFromNow(5)),
    time: '6:00 PM',
    durationMinutes: 100,
    seats: 100,
    registeredStudents: 35,
    trainer: 'Prithika',
    status: 'Draft',
    billing: 'Free',
    registrationDeadline: iso(daysFromNow(4)),
    mainWorkshopMinutes: 90,
    softPromotionMinutes: 10,
    totalEventMinutes: 100,
    banner: '',
    thumbnail: '',
    description: 'Learn prompt engineering and AI assisted coding with practical examples.',
  },
  {
    id: 'w-4',
    name: 'Career Growth with AI (Live)',
    category: 'Workshop',
    mode: 'Offline',
    date: iso(daysFromNow(0)),
    time: '11:00 AM',
    durationMinutes: 100,
    seats: 60,
    registeredStudents: 44,
    trainer: 'Bindu',
    status: 'Upcoming',
    billing: 'Paid',
    registrationDeadline: iso(daysFromNow(-3)),
    mainWorkshopMinutes: 90,
    softPromotionMinutes: 10,
    totalEventMinutes: 100,
    banner: '',
    thumbnail: '',
    description: 'AI tools and frameworks for interview coaching and career roadmap planning.',
  },
];

export const WORKSHOP_REGISTRATIONS_MOCK = [
  {
    id: 'r-1',
    workshopId: 'w-1',
    fullName: 'Arun Kumar',
    mobile: '9876543210',
    email: 'arun@example.com',
    college: 'XYZ College',
    course: 'B.Tech',
    year: '2nd Year',
    semester: '4',
    city: 'Chennai',
    status: 'Enrolled',
    attendancePct: 78,
    paymentStatus: 'Free',
    attendanceStatus: 'Completed',
    certificateEligible: true,
    createdAt: iso(daysFromNow(-9)),
  },
  {
    id: 'r-2',
    workshopId: 'w-1',
    fullName: 'Divya S',
    mobile: '9123456780',
    email: 'divya@example.com',
    college: 'ABC Institute',
    course: 'BCA',
    year: '3rd Year',
    semester: '5',
    city: 'Coimbatore',
    status: 'Enrolled',
    attendancePct: 55,
    paymentStatus: 'Free',
    attendanceStatus: 'No Show',
    certificateEligible: false,
    createdAt: iso(daysFromNow(-8)),
  },
  {
    id: 'r-3',
    workshopId: 'w-2',
    fullName: 'Karthik R',
    mobile: '9988776655',
    email: 'karthik@example.com',
    college: 'PQR University',
    course: 'B.Tech',
    year: '1st Year',
    semester: '2',
    city: 'Bengaluru',
    status: 'Registered',
    attendancePct: 0,
    paymentStatus: 'Paid',
    attendanceStatus: 'Joined',
    certificateEligible: false,
    createdAt: iso(daysFromNow(-1)),
  },
];

export const WORKSHOP_RECENT_ACTIVITIES_MOCK = [
  { type: 'Workshop Created', time: iso(daysFromNow(-8)), message: 'Workshop “AI Boot-Up by Younovate” was created', who: 'Admin' },
  { type: 'Registration Received', time: iso(daysFromNow(-6)), message: 'New lead registered: Arun Kumar', who: 'System' },
  { type: 'Attendance Completed', time: iso(daysFromNow(-2)), message: 'Attendance completed for Arun Kumar', who: 'System' },
  { type: 'Certificate Generated', time: iso(daysFromNow(-1)), message: 'Certificate issued to Arun Kumar', who: 'System' },
  { type: 'Lead Captured', time: iso(daysFromNow(-1)), message: 'Lead captured: Divya S', who: 'System' },
];

export const formatShortDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

export const formatDateTime = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export const computeAttendancePct = (attendancePct, feedbackSubmitted) => {
  // Rule placeholder for Phase 1 charts & eligibility
  // Eligibility requires: attendance >= 60 AND feedback submitted
  const elig = (attendancePct >= 60) && !!feedbackSubmitted;
  return { attendancePct, feedbackSubmitted: !!feedbackSubmitted, certificateEligible: elig };
};

export const getTodayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const normalizeWorkshopStatus = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('completed')) return 'completed';
  if (s.includes('upcoming')) return 'upcoming';
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('draft')) return 'draft';
  return 'draft';
};

