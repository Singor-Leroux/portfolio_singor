// Déclarations de types globaux

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { [key: string]: string };
  export default classes;
}

// Déclaration pour les fichiers d'images
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.webp';

// Déclaration pour les fichiers de données
declare module '../data' {
  import { Project, Certification, Skill, Experience, Education, PersonalInfo } from './index';
  
  export const projects: Project[];
  export const certifications: Certification[];
  export const skills: Skill[];
  export const experiences: Experience[];
  export const education: Education[];
  export const personalInfo: PersonalInfo;
}

// Déclaration pour les composants
declare module '../components/About' {
  import { FC } from 'react';
  const About: FC;
  export default About;
}

declare module '../components/Certifications' {
  import { FC } from 'react';
  const Certifications: FC;
  export default Certifications;
}

declare module '../components/Experience' {
  import { FC } from 'react';
  const Experience: FC;
  export default Experience;
}

declare module '../components/Contact' {
  import { FC } from 'react';
  const Contact: FC;
  export default Contact;
}

declare module '../components/Footer' {
  import { FC } from 'react';
  const Footer: FC;
  export default Footer;
}

declare module '../components/Header' {
  import { FC } from 'react';
  const Header: FC;
  export default Header;
}

declare module '../components/Hero' {
  import { FC } from 'react';
  const Hero: FC;
  export default Hero;
}

declare module '../components/Projects' {
  import { FC } from 'react';
  const Projects: FC;
  export default Projects;
}

declare module '../components/Skills' {
  import { FC } from 'react';
  const Skills: FC;
  export default Skills;
}
