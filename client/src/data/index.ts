import { Project, Certification, Skill, Experience, Education } from '../types/index';

export const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform with product listing, cart functionality, user authentication, and payment processing.",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe API"],
    imageUrl: "https://images.pexels.com/photos/900108/pexels-photo-900108.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    projectUrl: "https://example.com/ecommerce",
    githubUrl: "https://github.com/yourusername/ecommerce", // Replace 'yourusername' with your actual GitHub username
    category: "fullstack"
  },
  {
    id: 2,
    title: "Task Management App",
    description: "A Kanban-style task management application with drag-and-drop functionality, team collaboration, and real-time updates.",
    technologies: ["React", "Redux", "Firebase", "Material UI"],
    imageUrl: "https://images.pexels.com/photos/3888151/pexels-photo-3888151.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    projectUrl: "https://example.com/taskmanager",
    githubUrl: "https://github.com/yourusername/taskmanager",
    category: "frontend"
  },
  {
    id: 3,
    title: "Real-time Chat Application",
    description: "A real-time messaging application with private chats, group conversations, and file sharing capabilities.",
    technologies: ["React", "Socket.io", "Express", "MongoDB"],
    imageUrl: "https://images.pexels.com/photos/4126743/pexels-photo-4126743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    projectUrl: "https://example.com/chatapp",
    githubUrl: "https://github.com/yourusername/chatapp",
    category: "fullstack"
  },
  {
    id: 4,
    title: "Fitness Tracking Mobile App",
    description: "A cross-platform mobile application for tracking workouts, nutrition, and personal fitness goals.",
    technologies: ["React Native", "Redux", "Firebase", "Expo"],
    imageUrl: "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    projectUrl: "https://example.com/fitnessapp",
    githubUrl: "https://github.com/yourusername/fitnessapp",
    category: "mobile"
  },
  {
    id: 5,
    title: "API Microservices Architecture",
    description: "A backend system using microservices architecture for a scalable and maintainable application.",
    technologies: ["Node.js", "Express", "Docker", "Kubernetes", "MongoDB"],
    imageUrl: "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    githubUrl: "https://github.com/yourusername/microservices",
    category: "backend"
  },
  {
    id: 6,
    title: "Weather Forecast Dashboard",
    description: "An interactive weather dashboard showing current conditions and forecasts using external API integration.",
    technologies: ["React", "APIs", "Chart.js", "Tailwind CSS"],
    imageUrl: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    projectUrl: "https://example.com/weather",
    githubUrl: "https://github.com/username/weather",
    category: "frontend"
  }
];

export const certifications: Certification[] = [
  {
    id: 1,
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "October 2023",
    imageUrl: "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    verificationUrl: "https://example.com/verify/aws-cert"
  },
  {
    id: 2,
    title: "Full-Stack Web Development Bootcamp",
    issuer: "Coding Academy",
    date: "May 2022",
    imageUrl: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    verificationUrl: "https://example.com/verify/coding-bootcamp"
  },
  {
    id: 3,
    title: "MongoDB Certified Developer",
    issuer: "MongoDB University",
    date: "January 2023",
    imageUrl: "https://images.pexels.com/photos/1329294/pexels-photo-1329294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    verificationUrl: "https://example.com/verify/mongodb-cert"
  },
  {
    id: 4,
    title: "React Advanced Concepts",
    issuer: "Frontend Masters",
    date: "August 2023",
    imageUrl: "https://images.pexels.com/photos/11035386/pexels-photo-11035386.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    verificationUrl: "https://example.com/verify/react-cert"
  },
    {
    id: 5,
    title: "Legacy Full Stack Certification",
    issuer: "Full Stack",
    date: "May 2025",
    imageUrl: "./dist/assets/images/lfs3.jpg",
    verificationUrl: "https://www.freecodecamp.org/certification/fccabbf3548-9e0a-4804-ad84-0dffde32a115/full-stack"
  }
];

export const skills: Skill[] = [
  // Frontend
  { name: "HTML/CSS", level: 5, category: "frontend" },
  { name: "JavaScript", level: 5, category: "frontend" },
  { name: "TypeScript", level: 4, category: "frontend" },
  { name: "React", level: 5, category: "frontend" },
  { name: "Vue.js", level: 3, category: "frontend" },
  { name: "Angular", level: 3, category: "frontend" },
  { name: "Tailwind CSS", level: 4, category: "frontend" },
  { name: "Redux", level: 4, category: "frontend" },
  
  // Backend
  { name: "Node.js", level: 5, category: "backend" },
  { name: "Express", level: 5, category: "backend" },
  { name: "Python", level: 4, category: "backend" },
  { name: "Django", level: 3, category: "backend" },
  { name: "Java", level: 3, category: "backend" },
  { name: "Spring Boot", level: 2, category: "backend" },
  { name: "PHP", level: 2, category: "backend" },
  
  // Database
  { name: "MongoDB", level: 5, category: "database" },
  { name: "PostgreSQL", level: 4, category: "database" },
  { name: "MySQL", level: 4, category: "database" },
  { name: "Redis", level: 3, category: "database" },
  { name: "Firebase", level: 4, category: "database" },
  
  // DevOps
  { name: "Git", level: 5, category: "devops" },
  { name: "Docker", level: 4, category: "devops" },
  { name: "AWS", level: 4, category: "devops" },
  { name: "CI/CD", level: 3, category: "devops" },
  { name: "Kubernetes", level: 2, category: "devops" },
  
  // Other
  { name: "GraphQL", level: 3, category: "other" },
  { name: "RESTful APIs", level: 5, category: "other" },
  { name: "Testing (Jest, Mocha)", level: 4, category: "other" },
  { name: "Agile/Scrum", level: 4, category: "other" },
  { name: "UI/UX Design", level: 3, category: "other" }
];

export const experiences: Experience[] = [
  {
    id: 1,
    role: "Senior Full-Stack Developer",
    company: "Tech Innovations Inc.",
    duration: "Jan 2022 - Present",
    description: [
      "Led a team of 5 developers in building a SaaS platform that increased client efficiency by 40%",
      "Architected and implemented microservices infrastructure using Node.js and Docker",
      "Revamped the frontend using React and Redux, improving load times by 60%",
      "Implemented CI/CD pipelines that reduced deployment times by 75%"
    ],
    technologies: ["React", "Node.js", "MongoDB", "Docker", "AWS", "TypeScript"]
  },
  {
    id: 2,
    role: "Full-Stack Developer",
    company: "Digital Solutions Ltd.",
    duration: "Mar 2019 - Dec 2021",
    description: [
      "Developed and maintained multiple client projects using MERN stack",
      "Created RESTful APIs and integrated third-party services",
      "Implemented responsive designs and ensured cross-browser compatibility",
      "Participated in agile development cycles and client meetings"
    ],
    technologies: ["JavaScript", "React", "Express", "MongoDB", "Redis", "AWS"]
  },
  {
    id: 3,
    role: "Frontend Developer",
    company: "Creative Web Agency",
    duration: "Jun 2017 - Feb 2019",
    description: [
      "Built interactive web applications with modern JavaScript frameworks",
      "Collaborated with designers to implement pixel-perfect UI/UX designs",
      "Optimized web performance and implemented SEO best practices",
      "Mentored junior developers and conducted code reviews"
    ],
    technologies: ["HTML5", "CSS3", "JavaScript", "Vue.js", "Sass", "Webpack"]
  }
];

export const education: Education[] = [
  {
    id: 1,
    degree: "Master of Computer Science",
    institution: "Tech University",
    duration: "2015 - 2017",
    description: "Specialized in Software Engineering and Web Technologies. Graduated with honors."
  },
  {
    id: 2,
    degree: "Bachelor of Science in Computer Science",
    institution: "National University",
    duration: "2011 - 2015",
    description: "Focused on programming fundamentals, data structures, and algorithms. Completed several team projects."
  }
];

export const personalInfo = {
  name: "KPATCHOU Singor M.L",
  title: "Developeur Full-Stack",
  location: "Cotonou, Bénin",
  email: "kpatchousingor1@gmail.com",
  phone: "+229 01 66 47 91 58",
  about: "Développeur full-stack passionné avec plus de 6 ans d'expérience dans le développement d'applications web et mobiles. Je suis spécialisé dans la création de solutions robustes et évolutives utilisant des technologies modernes. Mon approche combine l'expertise technique avec une forte concentration sur l'expérience utilisateur et les objectifs commerciaux.",
  socialLinks: {
    github: "https://github.com/singor-leroux",
    linkedin: "https://linkedin.com/in/jeandupont",
    twitter: "https://twitter.com/jeandupont",
  }
};