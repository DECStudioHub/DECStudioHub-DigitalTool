export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  handle: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@DECStudio_YTOfficialChannel',
    icon: 'Youtube',
    color: 'hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10',
    handle: '@DECStudio_YTOfficialChannel',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com/tuxcustodio',
    icon: 'Facebook',
    color: 'hover:text-blue-500 hover:border-blue-500/40 hover:bg-blue-500/10',
    handle: 'tuxcustodio',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    url: 'https://www.tiktok.com/@decstudioofficial',
    icon: 'TikTok',
    color: 'hover:text-[#25F4EE] hover:border-[#25F4EE]/40 hover:bg-[#25F4EE]/10',
    handle: '@decstudioofficial',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/DECStudioHub',
    icon: 'Github',
    color: 'hover:text-white hover:border-slate-400 hover:bg-slate-700/30',
    handle: 'DECStudioHub',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/dante-escurido-custodio-jr-53421b145/',
    icon: 'Linkedin',
    color: 'hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10',
    handle: 'Dante Custodio Jr.',
  },
];
