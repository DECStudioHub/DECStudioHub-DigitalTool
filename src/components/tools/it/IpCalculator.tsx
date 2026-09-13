import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { RotateCcw, Network, AlertCircle, CheckCircle2 } from 'lucide-react';

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let num = 0;
  for (let i = 0; i < 4; i++) {
    const part = Number(parts[i]);
    if (isNaN(part) || part < 0 || part > 255 || parts[i].trim() === '' || (parts[i].length > 1 && parts[i].startsWith('0'))) {
      return null;
    }
    num = ((num << 8) | part) >>> 0;
  }
  return num;
}

function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

function intToBinary(num: number): string {
  const octets = [
    ((num >>> 24) & 255).toString(2).padStart(8, '0'),
    ((num >>> 16) & 255).toString(2).padStart(8, '0'),
    ((num >>> 8) & 255).toString(2).padStart(8, '0'),
    (num & 255).toString(2).padStart(8, '0'),
  ];
  return octets.join('.');
}

export const IpCalculator: React.FC = () => {
  const [ipInput, setIpInput] = useState('192.168.1.150');
  const [cidrInput, setCidrInput] = useState<number | string>(24);

  const reset = () => {
    setIpInput('192.168.1.150');
    setCidrInput(24);
  };

  const calculation = useMemo(() => {
    const ipInt = ipToInt(ipInput);
    const cidr = typeof cidrInput === 'number' ? cidrInput : parseInt(String(cidrInput), 10);

    if (ipInt === null) {
      return { error: 'Please enter a valid IPv4 address (e.g. 192.168.1.100)' };
    }
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return { error: 'CIDR prefix must be an integer between 0 and 32' };
    }

    // Subnet mask
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const netInt = (ipInt & maskInt) >>> 0;
    const bcastInt = (netInt | (~maskInt >>> 0)) >>> 0;

    let firstUsableInt = 0;
    let lastUsableInt = 0;
    let usableHosts = 0;

    if (cidr === 32) {
      firstUsableInt = netInt;
      lastUsableInt = netInt;
      usableHosts = 1;
    } else if (cidr === 31) {
      firstUsableInt = netInt;
      lastUsableInt = bcastInt;
      usableHosts = 2; // RFC 3021 point-to-point links
    } else {
      firstUsableInt = (netInt + 1) >>> 0;
      lastUsableInt = (bcastInt - 1) >>> 0;
      usableHosts = Math.pow(2, 32 - cidr) - 2;
    }

    // Determine type / scope
    const firstOctet = (ipInt >>> 24) & 255;
    const secondOctet = (ipInt >>> 16) & 255;
    let ipType = 'Public Internet';
    if (firstOctet === 10) ipType = 'Private (RFC 1918 Class A)';
    else if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ipType = 'Private (RFC 1918 Class B)';
    else if (firstOctet === 192 && secondOctet === 168) ipType = 'Private (RFC 1918 Class C)';
    else if (firstOctet === 127) ipType = 'Loopback (Localhost)';
    else if (firstOctet === 169 && secondOctet === 254) ipType = 'Link-Local (APIPA)';
    else if (firstOctet >= 224 && firstOctet <= 239) ipType = 'Multicast (Class D)';
    else if (firstOctet >= 240) ipType = 'Reserved (Class E)';

    return {
      error: null,
      ip: intToIp(ipInt),
      cidr,
      subnetMask: intToIp(maskInt),
      networkAddress: intToIp(netInt),
      broadcastAddress: intToIp(bcastInt),
      firstUsable: intToIp(firstUsableInt),
      lastUsable: intToIp(lastUsableInt),
      usableHosts: usableHosts.toLocaleString(),
      totalAddresses: Math.pow(2, 32 - cidr).toLocaleString(),
      binaryIp: intToBinary(ipInt),
      binaryMask: intToBinary(maskInt),
      ipType,
    };
  }, [ipInput, cidrInput]);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">IPv4 Address & CIDR Calculator</h3>
              <p className="text-xs text-slate-400">Compute subnet mask, host ranges, broadcast, and binary bitmasks</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              IPv4 Address
            </label>
            <input
              type="text"
              id="ip-calc-address"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              CIDR Prefix (/0 - /32)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-sm">/</span>
              <input
                type="number"
                id="ip-calc-cidr"
                min="0"
                max="32"
                value={cidrInput}
                onChange={(e) => setCidrInput(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1">Common Prefixes:</span>
          {[8, 16, 24, 25, 26, 27, 28, 29, 30].map((prefix) => (
            <button
              key={prefix}
              onClick={() => setCidrInput(prefix)}
              className={`text-[11px] px-2 py-0.5 rounded font-mono border transition ${
                Number(cidrInput) === prefix
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              /{prefix}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {calculation.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{calculation.error}</span>
        </div>
      ) : (
        /* Results Grid */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Subnet Mask</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-mono font-semibold text-cyan-400">{calculation.subnetMask}</span>
                <CopyButton textToCopy={calculation.subnetMask!} variant="icon" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Network Address</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-mono font-semibold text-emerald-400">{calculation.networkAddress}</span>
                <CopyButton textToCopy={calculation.networkAddress!} variant="icon" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Broadcast Address</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-mono font-semibold text-amber-400">{calculation.broadcastAddress}</span>
                <CopyButton textToCopy={calculation.broadcastAddress!} variant="icon" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Usable Host Capacity</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-mono font-semibold text-indigo-400">{calculation.usableHosts}</span>
                <span className="text-[11px] text-slate-400">Total: {calculation.totalAddresses}</span>
              </div>
            </div>
          </div>

          {/* Usable range & Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Usable Host Range</h4>
                <CopyButton
                  textToCopy={`${calculation.firstUsable} - ${calculation.lastUsable}`}
                  label="Copy Range"
                />
              </div>
              <div className="p-3 bg-[#0b0f19] rounded-lg border border-slate-800/80 font-mono text-sm space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500 text-xs">First Usable:</span>
                  <span className="text-emerald-400 font-medium">{calculation.firstUsable}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500 text-xs">Last Usable:</span>
                  <span className="text-cyan-400 font-medium">{calculation.lastUsable}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scope: <strong className="text-slate-200">{calculation.ipType}</strong></span>
              </div>
            </div>

            {/* Binary Bitmask Breakdown */}
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">32-Bit Binary Notation</h4>
                <CopyButton
                  textToCopy={`IP: ${calculation.binaryIp}\nMask: ${calculation.binaryMask}`}
                  label="Copy Binary"
                />
              </div>
              <div className="p-3 bg-[#0b0f19] rounded-lg border border-slate-800/80 font-mono text-xs space-y-2">
                <div>
                  <div className="text-[11px] text-slate-400 mb-0.5">IP Address Binary:</div>
                  <div className="text-cyan-300 tracking-wider break-all">{calculation.binaryIp}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 mb-0.5">Subnet Mask Binary:</div>
                  <div className="text-amber-300 tracking-wider break-all">{calculation.binaryMask}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
