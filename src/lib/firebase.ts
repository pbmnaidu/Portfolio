import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBpWi6_GoTxiZdCaoyRFeTmluqL7QxA9AA",
  authDomain: "portfolio-016.firebaseapp.com",
  projectId: "portfolio-016",
  storageBucket: "portfolio-016.firebasestorage.app",
  messagingSenderId: "180061528973",
  appId: "1:180061528973:web:25deef09ead2ee8ed853c4",
  measurementId: "G-4DFD6YW5S1"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = typeof window !== "undefined" ? getAuth(app) : null;
export const storage = typeof window !== "undefined" ? getStorage(app) : null;

// Auth Helper Functions
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return await signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string) {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function logoutUser() {
  if (!auth) return;
  return await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => { };
  }
  return onAuthStateChanged(auth, callback);
}

const PORTFOLIO_DOC_REF = doc(db, "portfolio", "content");

function getDocRef(userId?: string) {
  if (userId && userId.trim() !== "") {
    return doc(db, "portfolios", userId);
  }
  return PORTFOLIO_DOC_REF;
}

export interface ThemeConfig {
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  cursorStyle?: string;
  cursorColor?: string;
  bgPattern?: string;
}

export interface HeroConfig {
  bgNumber: string;
  location: string;
  profileImg: string;
  nameLine1: string;
  nameLine2: string;
  nameLine3: string;
  tagline: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  resumeLink: string;
  typeLine: string;
  brandTitle?: string;
}

export interface AboutConfig {
  p1: string;
  p2: string;
  p3: string;
  tags: string[];
  stats: {
    location: string;
    degree: string;
    institute: string;
    diplomaScore: string;
    sscScore: string;
    languages: string;
    linkedinHandle: string;
    linkedinUrl: string;
    codechefHandle: string;
    codechefUrl: string;
  };
}

export interface ExperienceItem {
  id: string;
  period: string;
  company: string;
  location: string;
  role: string;
  desc: string;
}

export interface ProjectItem {
  id: string;
  num: string;
  title: string;
  desc: string;
  techs: string[];
  liveUrl: string;
  codeUrl: string;
}

export interface SkillsConfig {
  languages: string[];
  web: string[];
  tools: string[];
}

export interface EducationItem {
  id: string;
  year: string;
  school: string;
  degree: string;
  score: string;
}

export interface ProfileItem {
  name: string;
  handle: string;
  url: string;
  icon: string;
}

export interface PortfolioData {
  theme: ThemeConfig;
  hero: HeroConfig;
  about: AboutConfig;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillsConfig;
  education: EducationItem[];
  achievements: string[];
  certifications: string[];
  profiles: ProfileItem[];
}

export const defaultPortfolioData: PortfolioData = {
  theme: {
    accent: "#8b5cf6",
    bg: "#09090e",
    surface: "#13121c",
    text: "#f3f4f6",
    muted: "#a78bfa",
    border: "#242038",
    cursorStyle: "ring",
    cursorColor: "#8b5cf6",
    bgPattern: "grid"
  },
  hero: {
    bgNumber: "PBMN",
    location: "Visakhapatnam, India",
    profileImg: "profile.jpeg",
    nameLine1: "Polimera",
    nameLine2: "Bhanuprakash",
    nameLine3: "Maliappala Naidu",
    tagline: "B.Tech CSE (AI) student at Vignan Institute of Information Technology. Building real-world applications, solving problems with code.",
    email: "bhanupolimera.9@gmail.com",
    phone: "+91 9703155423",
    linkedin: "https://linkedin.com/in/pbmnaidu",
    github: "https://github.com/404-PBMNaiduNotFound/Portfolio-",
    resumeLink: "BHANU-RESUME.pdf",
    typeLine: "B.TECH CSE (AI)",
    brandTitle: "Bhanu-Dev"
  },
  about: {
    p1: "Aspiring Computer Science student currently pursuing <strong>B.Tech in CSE (Artificial Intelligence)</strong> at Vignan Institute of Information Technology. I hold a <strong>Diploma in Computer Science Engineering with 89%</strong> from Andhra Polytechnic.",
    p2: "Skilled in <strong>programming, web development, and project development</strong> with hands-on experience from internships, hackathons, and real-world projects. I'm seeking opportunities to apply my technical skills and grow as a software developer.",
    p3: "Outside of code: cricket, competitive programming, hackathons, and endurance training keep me sharp.",
    tags: ["Quick Learner", "Problem Solving", "Team Collaboration", "OOP", "Adaptable", "Self-Motivated"],
    stats: {
      location: "Visakhapatnam, India",
      degree: "B.Tech CSE (AI)",
      institute: "Vignan Institute of IT",
      diplomaScore: "89%",
      sscScore: "93%",
      languages: "English, Hindi",
      linkedinHandle: "pbmnaidu",
      linkedinUrl: "https://linkedin.com/in/pbmnaidu",
      codechefHandle: "bhanupolimera",
      codechefUrl: "https://www.codechef.com/users/bhanupolimera"
    }
  },
  experiences: [
    {
      id: "exp-1",
      period: "INTERNSHIP",
      company: "Sampath Software Solutions",
      location: "Dwaraka Nagar, Visakhapatnam",
      role: "Web Development Intern",
      desc: "Worked on web development tasks using HTML, CSS, and JavaScript. Assisted in building and testing web pages and improving UI functionality across multiple projects."
    },
    {
      id: "exp-2",
      period: "INTERNSHIP",
      company: "FUTURE INTERN",
      location: "ONLINE",
      role: "Web Development Intern",
      desc: "Worked on web development tasks using HTML, CSS, JavaScript and FireBase. Completed 2 tasks which are portfolio and a CRM project."
    }
  ],
  projects: [
    {
      id: "proj-1",
      num: "01",
      title: "SevaSetu",
      desc: "A website connecting donors with nearby organizations like Old age homes,Temples,etc..Organizations post requriements and donor fill their repected needs of organization. Leveraged AI-assisted tools to support development and improve productivity.",
      techs: ["React", "Next.js", "AI Tools"],
      liveUrl: "https://sevasetuproject.vercel.app/",
      codeUrl: "https://github.com/404-PBMNaiduNotFound/sevasetu"
    },
    {
      id: "proj-2",
      num: "02",
      title: "Rock — Paper — Scissors",
      desc: "An interactive browser game where users play against the computer. Clean UI with game logic, score tracking, and win/loss detection.",
      techs: ["HTML", "CSS", "JavaScript"],
      liveUrl: "https://bhanu630.github.io/RPS/",
      codeUrl: "https://bhanu630.github.io"
    },
    {
      id: "proj-3",
      num: "03",
      title: "EduGuide — Smart Campus Chatbot",
      desc: "Developed during a college hackathon at Vignan Institute. Guides users with navigation routes to specific campus locations using a chatbot interface. Built with AI-assisted tools.",
      techs: ["Chatbot", "AI Tools", "Hackathon"],
      liveUrl: "https://eduguide-campusbot.vercel.app/",
      codeUrl: "https://github.com/404-PBMNaiduNotFound/eduguide-"
    }
  ],
  skills: {
    languages: ["C", "C++", "Java", "Python"],
    web: ["HTML", "CSS", "JavaScript", "React.js", "Next.js", "Tailwind CSS"],
    tools: ["VS Code", "Git", "GitHub", "Vercel", "Firebase"]
  },
  education: [
    {
      id: "edu-1",
      year: "2024 — 2027 (PURSUING)",
      school: "Vignan Institute of Information Technology",
      degree: "B.Tech — Computer Science Engineering (Artificial Intelligence)",
      score: "Active"
    },
    {
      id: "edu-2",
      year: "2021 — 2024",
      school: "Andhra Polytechnic, Kakinada",
      degree: "Diploma — Computer Science Engineering",
      score: "89%"
    },
    {
      id: "edu-3",
      year: "2020 — 2021",
      school: "De Paul School, Visakhapatnam",
      degree: "SSC (Class X)",
      score: "93%"
    }
  ],
  achievements: [
    "Hackathon Participant — Participated in a college hackathon at Vignan Institute, building EduGuide (Smart Campus Navigation Chatbot).",
    "Paper Presentation — Presented a technical paper at a national-level symposium.",
    "Certifications — Web Development internship completion certificates from Sampath Software Solutions & Future Intern."
  ],
  certifications: [
    "Web Development Internship Certificate — Sampath Software Solutions",
    "Web Development & Firebase Certificate — Future Intern"
  ],
  profiles: [
    { name: "GitHub", handle: "bhanupolimera", url: "https://github.com/404-PBMNaiduNotFound/Portfolio-", icon: "fab fa-github" },
    { name: "LinkedIn", handle: "pbmnaidu", url: "https://linkedin.com/in/pbmnaidu", icon: "fab fa-linkedin" },
    { name: "CodeChef", handle: "bhanupolimera", url: "https://www.codechef.com/users/bhanupolimera", icon: "fas fa-chess-knight" },
    { name: "LeetCode", handle: "Bhanu", url: "https://leetcode.com/u/pbmnaidu/", icon: "fas fa-code" },
    { name: "Email", handle: "bhanupolimera.9@gmail.com", url: "mailto:bhanupolimera.9@gmail.com", icon: "fas fa-envelope" }
  ]
};

export const emptyPortfolioData: PortfolioData = {
  theme: {
    accent: "#d1da28",
    bg: "#000000",
    surface: "#0a0a0d",
    text: "#ffffff",
    muted: "#decc5d",
    border: "#1f1f26",
    cursorStyle: "ring"
  },
  hero: {
    bgNumber: "",
    location: "",
    profileImg: "/profile.jpeg",
    nameLine1: "",
    nameLine2: "",
    nameLine3: "",
    tagline: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    resumeLink: "",
    typeLine: ""
  },
  about: {
    p1: "",
    p2: "",
    p3: "",
    tags: [],
    stats: {
      location: "",
      degree: "",
      institute: "",
      diplomaScore: "",
      sscScore: "",
      languages: "",
      linkedinHandle: "",
      linkedinUrl: "",
      codechefHandle: "",
      codechefUrl: ""
    }
  },
  experiences: [],
  projects: [],
  skills: {
    languages: [],
    web: [],
    tools: []
  },
  education: [],
  achievements: [],
  certifications: [],
  profiles: []
};

export async function getPortfolioData(userId?: string, userEmail?: string): Promise<{ data: PortfolioData; fromDb: boolean; seeded?: boolean }> {
  try {
    const targetRef = getDocRef(userId);
    const snap = await getDoc(targetRef);
    if (snap.exists()) {
      return { data: snap.data() as PortfolioData, fromDb: true };
    } else {
      // For first-time logged-in user, start with empty portfolio template so they enter their details from scratch
      const initialTemplate = userId
        ? { ...emptyPortfolioData, hero: { ...emptyPortfolioData.hero, email: userEmail || "" } }
        : defaultPortfolioData;

      try {
        await setDoc(targetRef, initialTemplate);
        return { data: initialTemplate, fromDb: true, seeded: true };
      } catch (err) {
        return { data: initialTemplate, fromDb: false };
      }
    }
  } catch (err) {
    const fallbackTemplate = userId ? emptyPortfolioData : defaultPortfolioData;
    return { data: fallbackTemplate, fromDb: false };
  }
}

export async function savePortfolioData(data: PortfolioData, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Cache theme & portfolio data to localStorage for zero-FOUC & zero-flicker instant paint on reload
    if (typeof window !== "undefined") {
      if (data.theme) localStorage.setItem("portfolioTheme", JSON.stringify(data.theme));
      localStorage.setItem("portfolioData", JSON.stringify(data));
    }
    const targetRef = getDocRef(userId);
    await setDoc(targetRef, data, { merge: true });

    // Also mirror update to public PORTFOLIO_DOC_REF so landing page reflects changes live
    if (userId) {
      try {
        await setDoc(PORTFOLIO_DOC_REF, data, { merge: true });
      } catch (e) { }
    }
    return { success: true };
  } catch (err: any) {
    console.error("Firestore save error:", err);
    return { success: false, error: err.message || "Failed to save portfolio data." };
  }
}

export function subscribePortfolioData(onUpdate: (data: PortfolioData) => void, userId?: string) {
  try {
    const targetRef = getDocRef(userId);
    return onSnapshot(targetRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data() as PortfolioData;
        if (typeof window !== "undefined") {
          if (d.theme) localStorage.setItem("portfolioTheme", JSON.stringify(d.theme));
          localStorage.setItem("portfolioData", JSON.stringify(d));
        }
        onUpdate(d);
      } else {
        onUpdate(userId ? emptyPortfolioData : defaultPortfolioData);
      }
    }, (err) => {
      console.warn("Subscription error:", err);
      onUpdate(userId ? emptyPortfolioData : defaultPortfolioData);
    });
  } catch (err) {
    onUpdate(userId ? emptyPortfolioData : defaultPortfolioData);
    return () => { };
  }
}

// Fast Client-Side Image Compression & Data URL Processor (< 0.1s)
export async function fastProcessFile(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (file.type && file.type.startsWith("image/")) {
      const compressedUrl = await compressImage(file, 600, 600, 0.85);
      if (compressedUrl) {
        return { success: true, url: compressedUrl };
      }
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ success: true, url: e.target?.result as string });
      reader.onerror = () => resolve({ success: false, error: "Failed to read file." });
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function compressImage(file: File, maxWidth = 600, maxHeight = 600, quality = 0.85): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith("image/")) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
