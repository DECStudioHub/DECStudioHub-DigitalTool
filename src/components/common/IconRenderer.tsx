import React from 'react';
import {
  Terminal,
  Calculator,
  Bike,
  Zap,
  Ruler,
  Image as ImageIcon,
  Coffee,
  Network,
  Split,
  Wifi,
  Activity,
  Layers,
  Percent,
  CalendarClock,
  Calendar,
  Landmark,
  Coins,
  Tag,
  TrendingUp,
  Fuel,
  Navigation,
  Gauge,
  Wrench,
  Sun,
  BatteryCharging,
  Cpu,
  Orbit,
  ReceiptText,
  Sliders,
  Cable,
  Scaling,
  FileArchive,
  RefreshCw,
  Heart,
  Search,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Info,
  AlertTriangle,
  Download,
  Upload,
  Plus,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  Globe,
  Puzzle,
  Radio,
  AppWindow,
  Cake,
  CreditCard,
  Banknote,
  Milestone,
  Home,
  Plug,
  Lightbulb,
  Sigma,
  TrendingDown,
  ShieldAlert,
  Youtube,
  Facebook,
  Github,
  Linkedin,
  Video,
  MessageSquare,
  MessageCircle,
  Battery,
  Shield,
  FileText,
  CheckCircle2,
  HelpCircle,
  Star,
  ClipboardList,
  Binary,
  ListChecks,
  LucideProps
} from 'lucide-react';

export const TikTokIcon: React.FC<LucideProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  strokeWidth,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Cyan layer */}
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.76 0 2.89 2.89 0 0 1 2.88-2.88c.4 0 .79.08 1.14.24V9.52a6.31 6.31 0 0 0-1.14-.1 6.34 6.34 0 0 0-6.32 6.34 6.34 6.34 0 0 0 6.32 6.34 6.34 6.34 0 0 0 6.33-6.34V8.47a8.21 8.21 0 0 0 4.97 1.66V6.69z"
        fill="#25F4EE"
        transform="translate(-0.8, -0.6)"
        opacity="0.95"
      />
      {/* Red / Magenta layer */}
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.76 0 2.89 2.89 0 0 1 2.88-2.88c.4 0 .79.08 1.14.24V9.52a6.31 6.31 0 0 0-1.14-.1 6.34 6.34 0 0 0-6.32 6.34 6.34 6.34 0 0 0 6.32 6.34 6.34 6.34 0 0 0 6.33-6.34V8.47a8.21 8.21 0 0 0 4.97 1.66V6.69z"
        fill="#FE2C55"
        transform="translate(0.8, 0.6)"
        opacity="0.95"
      />
      {/* Core white glyph */}
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.76 0 2.89 2.89 0 0 1 2.88-2.88c.4 0 .79.08 1.14.24V9.52a6.31 6.31 0 0 0-1.14-.1 6.34 6.34 0 0 0-6.32 6.34 6.34 6.34 0 0 0 6.32 6.34 6.34 6.34 0 0 0 6.33-6.34V8.47a8.21 8.21 0 0 0 4.97 1.66V6.69z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

const ICONS_MAP: Record<string, React.FC<LucideProps>> = {
  Terminal,
  Calculator,
  Bike,
  Zap,
  Ruler,
  Image: ImageIcon,
  Coffee,
  Network,
  Split,
  Wifi,
  Activity,
  Layers,
  Percent,
  CalendarClock,
  Calendar,
  Landmark,
  Coins,
  Tag,
  TrendingUp,
  Fuel,
  Navigation,
  Gauge,
  Wrench,
  Sun,
  BatteryCharging,
  Cpu,
  Orbit,
  ReceiptText,
  Sliders,
  Cable,
  Scaling,
  FileArchive,
  RefreshCw,
  Heart,
  Search,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Info,
  AlertTriangle,
  Download,
  Upload,
  Plus,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  Globe,
  Puzzle,
  Radio,
  AppWindow,
  Cake,
  CreditCard,
  Banknote,
  Milestone,
  Home,
  Plug,
  Lightbulb,
  Sigma,
  TrendingDown,
  ShieldAlert,
  Youtube,
  Facebook,
  Github,
  Linkedin,
  Video,
  MessageSquare,
  MessageCircle,
  Battery,
  Shield,
  FileText,
  CheckCircle2,
  HelpCircle,
  Star,
  ClipboardList,
  Binary,
  ListChecks,
  TikTok: TikTokIcon,
  Tiktok: TikTokIcon,
  tiktok: TikTokIcon,
};

interface IconRendererProps extends LucideProps {
  name?: string;
  icon?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, icon, ...props }) => {
  const iconKey = icon || name || 'Activity';
  const IconComponent = ICONS_MAP[iconKey] || Activity;
  return <IconComponent {...props} />;
};
