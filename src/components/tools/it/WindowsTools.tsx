import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { DisclaimerBox } from '../../common/DisclaimerBox';
import { Layers, Search, Keyboard } from 'lucide-react';

interface WinTool {
  name: string;
  runCommand: string;
  altShortcut?: string;
  category: 'Diagnostics' | 'System' | 'Management' | 'Networking';
  description: string;
  useCase: string;
}

const WINDOWS_TOOLS: WinTool[] = [
  {
    name: 'Command Prompt',
    runCommand: 'cmd',
    altShortcut: 'Win + R, type cmd',
    category: 'System',
    description: 'The standard Windows command interpreter for running scripts and command-line diagnostics.',
    useCase: 'Network troubleshooting, running ping/ipconfig, executing batch scripts, disk repair.',
  },
  {
    name: 'PowerShell',
    runCommand: 'powershell',
    altShortcut: 'Win + X, then click Windows Terminal / PowerShell',
    category: 'System',
    description: 'Powerful object-oriented task automation and configuration management framework from Microsoft.',
    useCase: 'Advanced automation, Windows package management (winget), cloud administration, WMI queries.',
  },
  {
    name: 'Windows Settings',
    runCommand: 'ms-settings:',
    altShortcut: 'Win + I',
    category: 'Management',
    description: 'Modern unified settings interface for Windows updates, privacy, display, accounts, and hardware.',
    useCase: 'Configuring WiFi networks, Bluetooth pairing, adjusting display resolution, running Windows Update.',
  },
  {
    name: 'Control Panel',
    runCommand: 'control',
    altShortcut: 'Win + R, type control',
    category: 'Management',
    description: 'Legacy Windows administrative control center with classic applets.',
    useCase: 'Power plan options, advanced sound configuration, mail profiles, credential manager.',
  },
  {
    name: 'Programs and Features',
    runCommand: 'appwiz.cpl',
    altShortcut: 'Win + R, type appwiz.cpl',
    category: 'Management',
    description: 'Classic add/remove programs interface and Windows optional features installer.',
    useCase: 'Uninstalling legacy desktop software, turning on Hyper-V or WSL (Windows Subsystem for Linux).',
  },
  {
    name: 'Network Connections',
    runCommand: 'ncpa.cpl',
    altShortcut: 'Win + R, type ncpa.cpl',
    category: 'Networking',
    description: 'Direct access to all network adapters (Ethernet, WiFi, VPN, Virtual Switch adapters).',
    useCase: 'Assigning static IP/DNS addresses, enabling/disabling NICs, configuring IPv6 or adapter binding.',
  },
  {
    name: 'Device Manager',
    runCommand: 'devmgmt.msc',
    altShortcut: 'Win + X, then M',
    category: 'Diagnostics',
    description: 'Hardware configuration console displaying all installed physical and virtual device drivers.',
    useCase: 'Updating GPU/WiFi drivers, resolving yellow exclamation mark conflicts, viewing hardware IDs.',
  },
  {
    name: 'Disk Management',
    runCommand: 'diskmgmt.msc',
    altShortcut: 'Win + X, then K',
    category: 'Management',
    description: 'Partition manager for internal hard drives, SSDs, external USB drives, and virtual disks.',
    useCase: 'Initializing new SSDs, shrinking/extending volumes, formatting NTFS/exFAT, assigning drive letters.',
  },
  {
    name: 'Windows Services',
    runCommand: 'services.msc',
    altShortcut: 'Win + R, type services.msc',
    category: 'System',
    description: 'Console for viewing and controlling background system services and daemons.',
    useCase: 'Restarting print spooler, configuring Windows Update service startup type (Manual/Disabled).',
  },
  {
    name: 'Event Viewer',
    runCommand: 'eventvwr.msc',
    altShortcut: 'Win + X, then V',
    category: 'Diagnostics',
    description: 'Centralized repository of application, system, setup, and security event logs and crash dumps.',
    useCase: 'Investigating BSOD crash causes (Kernel-Power 41), application hangs, and failed sign-in attempts.',
  },
  {
    name: 'Task Manager',
    runCommand: 'taskmgr',
    altShortcut: 'Ctrl + Shift + Esc',
    category: 'Diagnostics',
    description: 'Real-time performance monitor for CPU, RAM, GPU, Disk, network, and startup applications.',
    useCase: 'Ending non-responsive tasks, monitoring hardware bottlenecks, disabling bloatware at startup.',
  },
  {
    name: 'DirectX Diagnostic Tool',
    runCommand: 'dxdiag',
    altShortcut: 'Win + R, type dxdiag',
    category: 'Diagnostics',
    description: 'Detailed report of graphics drivers, audio devices, DirectX feature levels, and GPU VRAM.',
    useCase: 'Checking GPU driver dates, verifying Direct3D acceleration, audio troubleshooting for games.',
  },
  {
    name: 'System Information',
    runCommand: 'msinfo32',
    altShortcut: 'Win + R, type msinfo32',
    category: 'Diagnostics',
    description: 'Comprehensive hardware and software configuration overview including motherboard model & BIOS.',
    useCase: 'Checking UEFI/BIOS version, Secure Boot state, RAM slot configuration, and hardware abstraction layer.',
  },
];

export const WindowsTools: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTools = useMemo(() => {
    const q = search.toLowerCase().trim();
    return WINDOWS_TOOLS.filter((tool) => {
      const matchCat = activeCategory === 'all' || tool.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.runCommand.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.useCase.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Windows Tools & Run Launcher Reference</h3>
              <p className="text-xs text-slate-400">Direct Run commands (Win + R) and shortcuts for essential Windows consoles</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg">
            <Keyboard className="w-3.5 h-3.5 text-blue-400" />
            <span>Shortcut: Press <strong>Win + R</strong>, paste command & hit Enter</span>
          </div>
        </div>

        {/* Filter & search inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="wintools-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Windows tool or command (e.g. devmgmt, ncpa.cpl, dxdiag)..."
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Diagnostics', 'Management', 'Networking', 'System'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition border ${
                  activeCategory === cat
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sandboxed browser disclaimer box */}
      <DisclaimerBox
        type="info"
        title="Browser Security Architecture Notice"
        text="Modern web browsers execute within a strict sandboxed environment and cannot directly launch local binaries or operating system executables on your device. Use the convenient 'Run Command' copy buttons below, then press Windows Key + R on your physical keyboard and paste the command to launch the utility natively."
      />

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.name}
            className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {tool.name}
                    <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {tool.category}
                    </span>
                  </h4>
                  {tool.altShortcut && (
                    <div className="text-[11px] text-slate-500 mt-0.5">{tool.altShortcut}</div>
                  )}
                </div>
                <CopyButton textToCopy={tool.runCommand} label="Copy Run" />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-3">
                {tool.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <div className="p-2.5 bg-[#0b0f19] rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Run Command:</span>
                  <span className="text-blue-400 font-semibold">{tool.runCommand}</span>
                </div>
                <CopyButton textToCopy={tool.runCommand} variant="icon" />
              </div>

              <div className="text-[11px] text-slate-400">
                <strong className="text-slate-300">Common Use:</strong> {tool.useCase}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
