import { Profile, StudyTeam, Message } from './types';

export const POPULAR_SKILLS = [
  'React',
  'Figma',
  'Rust',
  'Golang',
  'Cybersecurity',
  'Web3',
  'Python',
  'Mobile',
  'Data Science',
  'UI Design',
  'Machine Learning',
  'Public Speaking',
  'Solidity',
  'Product Management'
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user_me',
    name: 'Aman Chouhan',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Full Stack Dev building for the web. Love high-fidelity web experiences and interactive products. Let\'s swap some knowledge!',
    college: 'Delhi Technological University',
    teachSkills: ['React', 'Web3', 'Python'],
    learnSkills: ['Figma', 'Rust', 'UI Design'],
    rating: 4.9,
    matchesCount: 15,
    location: 'Delhi, IN',
    isUser: true,
    contactUrl: 'mailto:amanchouhan1196@gmail.com'
  },
  {
    id: 'profile_arpit',
    name: 'Arpit Bhardwaj',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Figma power-user, UI designer, and design system architect. Need help crafting slick micro-interactions or solid user journeys? Let\'s talk!',
    college: 'NSUT Delhi',
    teachSkills: ['Figma', 'UI Design', 'Mobile'],
    learnSkills: ['React', 'Rust', 'Web3'],
    rating: 5.0,
    matchesCount: 24,
    location: 'Delhi, IN'
  },
  {
    id: 'profile_meera',
    name: 'Meera Sen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Data Scientist & ML researcher. I have spent 3 years fine-tuning models and slicing datasets. Wanting to learn Web3 & Solidity for decentralized AI.',
    college: 'BITS Pilani',
    teachSkills: ['Data Science', 'Python', 'Machine Learning'],
    learnSkills: ['Web3', 'Solidity', 'React'],
    rating: 4.8,
    matchesCount: 18,
    location: 'Rajasthan, IN'
  },
  {
    id: 'profile_chaitanya',
    name: 'Chaitanya K.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Ethical hacker and server hardening geek. I eat Linux security configurations for breakfast. Wanting to pick up mobile development and UI design.',
    college: 'IIT Bombay',
    teachSkills: ['Cybersecurity', 'Golang', 'Rust'],
    learnSkills: ['Mobile', 'UI Design', 'Figma'],
    rating: 4.9,
    matchesCount: 32,
    location: 'Mumbai, IN'
  },
  {
    id: 'profile_riya',
    name: 'Riya Sharma',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    bio: 'Android & iOS engineer. I specialize in Flutter and React Native. Need to learn web frameworks and public speaking for pitch competitions.',
    college: 'DTU',
    teachSkills: ['Mobile', 'React', 'Figma'],
    learnSkills: ['Public Speaking', 'Rust', 'Golang'],
    rating: 4.7,
    matchesCount: 11,
    location: 'Delhi, IN'
  },
  {
    id: 'profile_devashish',
    name: 'Devashish Raj',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Backend scale developer. I build lightning-fast systems in Golang and Rust. Always looking to collaborate on high-frequency databases. Wanting to learn UI/UX design.',
    college: 'IIIT Delhi',
    teachSkills: ['Rust', 'Golang', 'Python'],
    learnSkills: ['UI Design', 'Figma', 'Product Management'],
    rating: 5.0,
    matchesCount: 29,
    location: 'Delhi, IN'
  }
];

export const INITIAL_TEAMS: StudyTeam[] = [
  {
    id: 'team_web3_hack',
    name: 'EthDelhi Web3 Innovators',
    description: 'Looking for a solid React front-end wizard and a Solidity contract auditor to build a decentralized skill-exchange protocol for the upcoming hackathon!',
    category: 'Hackathon',
    skillsRequired: ['Web3', 'Solidity', 'React'],
    membersCount: 2,
    maxMembers: 4,
    joined: false,
    imageColor: 'from-[#eaff00] to-yellow-400',
    createdBy: 'Arpit Bhardwaj'
  },
  {
    id: 'team_rust_kernel',
    name: 'Rust Systems Study Group',
    description: 'Diving deep into async runtimes, compiler memory models, and zero-cost abstractions in Rust. Weekly code reviews and pair programming sessions.',
    category: 'Study Group',
    skillsRequired: ['Rust', 'Golang'],
    membersCount: 4,
    maxMembers: 8,
    joined: true,
    imageColor: 'from-blue-600 to-[#2563eb]',
    createdBy: 'Chaitanya K.'
  },
  {
    id: 'team_figma_sprint',
    name: 'Figma Neo-Brutalist Design Sprint',
    description: 'We are creating a comprehensive, modular Neo-Brutalist component UI kit. Designing everything from scratch. Beginners welcome if you bring energy!',
    category: 'Design Sprint',
    skillsRequired: ['Figma', 'UI Design'],
    membersCount: 3,
    maxMembers: 6,
    joined: false,
    imageColor: 'from-pink-600 to-rose-400',
    createdBy: 'Riya Sharma'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    swapId: 'profile_arpit',
    senderId: 'profile_arpit',
    text: 'Hey Aman! I saw you teach React and want to learn Figma. I would love to swap. I am working on a portfolio website and need some React help.',
    timestamp: '10:14 AM'
  },
  {
    id: 'm2',
    swapId: 'profile_arpit',
    senderId: 'user_me',
    text: 'Hi Arpit! That sounds awesome. I can absolutely help you with React and modern responsive styling. Let\'s do a 1-hour session this Friday?',
    timestamp: '10:18 AM'
  },
  {
    id: 'm3',
    swapId: 'profile_arpit',
    senderId: 'profile_arpit',
    text: 'Perfect! I will prepare some of my Figma designs that we can rebuild, and I\'ll walk you through component states and auto-layouts in Figma.',
    timestamp: '10:20 AM'
  },
  {
    id: 'm4',
    swapId: 'profile_chaitanya',
    senderId: 'profile_chaitanya',
    text: 'Hey Aman, noticed your profile! Let\'s pair up. I can teach you the basics of Rust systems programming, if you can help me understand React states.',
    timestamp: 'Yesterday'
  }
];
