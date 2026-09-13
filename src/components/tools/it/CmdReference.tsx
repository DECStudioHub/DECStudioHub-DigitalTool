import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { Terminal, Search, Filter } from 'lucide-react';

interface CmdItem {
  command: string;
  category: 'Network' | 'System' | 'Files' | 'Admin';
  description: string;
  syntax: string;
  example: string;
  notes?: string;
}

const CMD_DATA: CmdItem[] = [
  {
    command: 'ipconfig',
    category: 'Network',
    description: 'Displays all current TCP/IP network configuration values and refreshes DHCP and DNS settings.',
    syntax: 'ipconfig [/all] [/release] [/renew] [/flushdns]',
    example: 'ipconfig /flushdns',
    notes: 'Use /all for MAC addresses and DHCP lease times; /flushdns resolves DNS cache corruption.',
  },
  {
    command: 'ping',
    category: 'Network',
    description: 'Sends ICMP Echo Request messages to verify IP-level connectivity to another computer or domain.',
    syntax: 'ping [-t] [-n count] [-l size] <target>',
    example: 'ping 8.8.8.8 -t',
    notes: 'Press Ctrl+C to stop continuous pinging (-t).',
  },
  {
    command: 'tracert',
    category: 'Network',
    description: 'Traces the path that an IP packet takes to its destination, showing each intermediate hop router and latency.',
    syntax: 'tracert [-d] [-h max_hops] <target>',
    example: 'tracert -d google.com',
    notes: 'The -d switch speeds up traceroute by preventing DNS resolution of hop IP addresses.',
  },
  {
    command: 'nslookup',
    category: 'Network',
    description: 'Queries Domain Name System (DNS) servers to look up host IP addresses, MX records, and reverse lookups.',
    syntax: 'nslookup <domain> [dns_server]',
    example: 'nslookup google.com 1.1.1.1',
    notes: 'Specify a custom DNS resolver like 1.1.1.1 or 8.8.8.8 as the second argument.',
  },
  {
    command: 'netstat',
    category: 'Network',
    description: 'Displays active TCP connections, listening ports, Ethernet statistics, and routing table.',
    syntax: 'netstat [-a] [-n] [-o] [-b]',
    example: 'netstat -ano | findstr :3000',
    notes: '-ano displays port numbers and Process IDs (PID) to identify which application holds a port.',
  },
  {
    command: 'sfc',
    category: 'System',
    description: 'System File Checker scans the integrity of all protected system files and replaces corrupted files with cached copies.',
    syntax: 'sfc /scannow',
    example: 'sfc /scannow',
    notes: 'Must be run inside an Administrator Command Prompt or PowerShell.',
  },
  {
    command: 'DISM',
    category: 'System',
    description: 'Deployment Image Servicing and Management repairs the Windows component store and system image using Windows Update.',
    syntax: 'DISM /Online /Cleanup-Image /RestoreHealth',
    example: 'DISM /Online /Cleanup-Image /RestoreHealth',
    notes: 'Often run before SFC when system corruption is persistent.',
  },
  {
    command: 'systeminfo',
    category: 'System',
    description: 'Displays detailed configuration information about a computer and its operating system, RAM, BIOS, and hotfixes.',
    syntax: 'systeminfo',
    example: 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version"',
    notes: 'Useful for quick inventory audits and checking original OS install date.',
  },
  {
    command: 'tasklist',
    category: 'System',
    description: 'Displays a comprehensive list of currently running processes on local or remote machines.',
    syntax: 'tasklist [/fi "status eq running"] [/m [module]]',
    example: 'tasklist /fi "imagename eq chrome.exe"',
    notes: 'Combine with taskkill /PID <num> /F to terminate frozen processes.',
  },
  {
    command: 'chkdsk',
    category: 'System',
    description: 'Checks the file system and volume metadata of a disk partition for logical and physical errors.',
    syntax: 'chkdsk [volume:] [/f] [/r] [/x]',
    example: 'chkdsk C: /f /r',
    notes: 'Requires a system reboot if scanning the active OS boot drive.',
  },
  {
    command: 'cd',
    category: 'Files',
    description: 'Changes the current working directory, or displays the current directory name.',
    syntax: 'cd [/d] [drive:][path]',
    example: 'cd /d D:\\Projects\\App',
    notes: 'Use the /d switch to switch drive letter and directory simultaneously.',
  },
  {
    command: 'dir',
    category: 'Files',
    description: 'Displays a list of files and subdirectories in a directory.',
    syntax: 'dir [path] [/a] [/o:order] [/s] [/b]',
    example: 'dir /b /s *.log',
    notes: '/b gives bare filenames (no headers/footers), /s searches all subdirectories recursively.',
  },
  {
    command: 'mkdir',
    category: 'Files',
    description: 'Creates a new directory or folder structure.',
    syntax: 'mkdir [path] (or md [path])',
    example: 'mkdir C:\\Backup\\2026',
    notes: 'Can create intermediate parent directories automatically in modern Windows CMD.',
  },
  {
    command: 'copy',
    category: 'Files',
    description: 'Copies one or more files to another specified location.',
    syntax: 'copy [/y] [/v] <source> <destination>',
    example: 'copy /y config.json config.backup.json',
    notes: '/y suppresses prompting to confirm you want to overwrite an existing destination file.',
  },
  {
    command: 'move',
    category: 'Files',
    description: 'Moves one or more files from one directory to another directory or renames directories.',
    syntax: 'move [/y] <source> <destination>',
    example: 'move *.csv C:\\Reports\\Archived',
    notes: 'Works across directories on the same drive or different drives.',
  },
  {
    command: 'del',
    category: 'Files',
    description: 'Deletes one or more files permanently (does not send to Recycle Bin).',
    syntax: 'del [/p] [/f] [/s] [/q] <names>',
    example: 'del /q /f temp_*.tmp',
    notes: 'Warning: del is permanent! Use /q to quiet confirmation prompts.',
  },
  {
    command: 'cls',
    category: 'Files',
    description: 'Clears the Command Prompt terminal screen buffer and positions cursor at top-left.',
    syntax: 'cls',
    example: 'cls',
    notes: 'Equivalent to the "clear" command in Linux / Unix bash shells.',
  },
  {
    command: 'shutdown',
    category: 'Admin',
    description: 'Shuts down, restarts, signs out, or hibernates local or networked computers.',
    syntax: 'shutdown [/s | /r | /l | /a] [/t xxx]',
    example: 'shutdown /r /t 0',
    notes: 'Use /r for restart, /s for shutdown, /t 0 for immediate execution, /a to abort an active countdown.',
  },
];

export const CmdReference: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCommands = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CMD_DATA.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.command.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.syntax.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    });
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Windows CMD Command Reference</h3>
              <p className="text-xs text-slate-400">Essential command prompt syntax, flags, and one-click copyable examples</p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredCommands.length}</strong> of {CMD_DATA.length} commands
          </div>
        </div>

        {/* Filter & search inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="cmd-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search command, parameter, or keyword (e.g. dns, ping, sfc)..."
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Network', 'System', 'Files', 'Admin'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Commands List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommands.map((cmd) => (
          <div
            key={cmd.command}
            className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                    {cmd.command}
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                    {cmd.category}
                  </span>
                </div>
                <CopyButton textToCopy={cmd.example} label="Copy Example" />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-3">
                {cmd.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Syntax:</div>
                <div className="text-slate-300 select-all overflow-x-auto">{cmd.syntax}</div>
              </div>

              <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs flex items-center justify-between gap-2">
                <div className="overflow-x-auto">
                  <span className="text-emerald-400">$ </span>
                  <span className="text-cyan-300 font-semibold">{cmd.example}</span>
                </div>
                <CopyButton textToCopy={cmd.example} variant="icon" />
              </div>

              {cmd.notes && (
                <div className="text-[11px] text-slate-400 italic">
                  Tip: {cmd.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCommands.length === 0 && (
        <div className="p-8 text-center bg-[#111827] rounded-2xl border border-slate-800 text-slate-400">
          No command matched &quot;{search}&quot;. Try searching for &quot;ping&quot;, &quot;dns&quot;, or &quot;shutdown&quot;.
        </div>
      )}
    </div>
  );
};
