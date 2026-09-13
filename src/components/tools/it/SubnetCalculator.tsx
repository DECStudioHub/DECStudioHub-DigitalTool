import React, { useState, useMemo } from 'react';
import { CopyButton } from '../../common/CopyButton';
import { RotateCcw, Split, AlertCircle } from 'lucide-react';

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

export const SubnetCalculator: React.FC = () => {
  const [networkInput, setNetworkInput] = useState('192.168.0.0');
  const [origCidr, setOrigCidr] = useState<number | string>(24);
  const [desiredSubnets, setDesiredSubnets] = useState<number | string>(4);
  const [tableLimit, setTableLimit] = useState(16);

  const reset = () => {
    setNetworkInput('192.168.0.0');
    setOrigCidr(24);
    setDesiredSubnets(4);
    setTableLimit(16);
  };

  const results = useMemo(() => {
    const ipInt = ipToInt(networkInput);
    const cidr = typeof origCidr === 'number' ? origCidr : parseInt(String(origCidr), 10);
    const subnetsWanted = typeof desiredSubnets === 'number' ? desiredSubnets : parseInt(String(desiredSubnets), 10);

    if (ipInt === null) {
      return { error: 'Please enter a valid IPv4 network address (e.g. 192.168.0.0)' };
    }
    if (isNaN(cidr) || cidr < 1 || cidr > 30) {
      return { error: 'Original CIDR prefix must be between /1 and /30' };
    }
    if (isNaN(subnetsWanted) || subnetsWanted < 1) {
      return { error: 'Desired subnets must be at least 1' };
    }

    // Mask for original network
    const origMask = (~0 << (32 - cidr)) >>> 0;
    const baseNet = (ipInt & origMask) >>> 0;

    // Additional bits required: ceil(log2(subnetsWanted))
    const bitsNeeded = Math.max(1, Math.ceil(Math.log2(subnetsWanted)));
    const newCidr = cidr + bitsNeeded;

    if (newCidr > 32) {
      return {
        error: `Cannot create ${subnetsWanted} subnets from /${cidr}. Would require /${newCidr}, which exceeds /32 limit.`,
      };
    }

    const totalSubnets = Math.pow(2, bitsNeeded);
    const blockSize = Math.pow(2, 32 - newCidr);
    const hostsPerSubnet = newCidr >= 31 ? (newCidr === 31 ? 2 : 1) : blockSize - 2;

    const newMaskInt = (~0 << (32 - newCidr)) >>> 0;
    const newSubnetMask = intToIp(newMaskInt);

    // Generate subnets list
    const subnetsList = [];
    const countToGenerate = Math.min(totalSubnets, tableLimit);

    for (let i = 0; i < countToGenerate; i++) {
      const net = (baseNet + i * blockSize) >>> 0;
      const bcast = (net + blockSize - 1) >>> 0;
      let firstUsable = '';
      let lastUsable = '';

      if (newCidr === 32) {
        firstUsable = intToIp(net);
        lastUsable = intToIp(net);
      } else if (newCidr === 31) {
        firstUsable = intToIp(net);
        lastUsable = intToIp(bcast);
      } else {
        firstUsable = intToIp((net + 1) >>> 0);
        lastUsable = intToIp((bcast - 1) >>> 0);
      }

      subnetsList.push({
        index: i + 1,
        network: intToIp(net),
        broadcast: intToIp(bcast),
        range: `${firstUsable} - ${lastUsable}`,
      });
    }

    return {
      error: null,
      origCidr: cidr,
      newCidr,
      totalSubnets,
      bitsBorrowed: bitsNeeded,
      hostsPerSubnet: hostsPerSubnet.toLocaleString(),
      newSubnetMask,
      subnetsList,
      hasMore: totalSubnets > countToGenerate,
    };
  }, [networkInput, origCidr, desiredSubnets, tableLimit]);

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Subnet Calculator (VLSM / FLSM)</h3>
              <p className="text-xs text-slate-400">Partition networks by desired subnets and view generated subnet ranges</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Network Address
            </label>
            <input
              type="text"
              id="subnet-network-address"
              value={networkInput}
              onChange={(e) => setNetworkInput(e.target.value)}
              placeholder="e.g. 192.168.0.0"
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Original Prefix (/CIDR)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-sm">/</span>
              <input
                type="number"
                id="subnet-orig-cidr"
                min="1"
                max="30"
                value={origCidr}
                onChange={(e) => setOrigCidr(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Number of Desired Subnets
            </label>
            <input
              type="number"
              id="subnet-desired-count"
              min="1"
              max="1024"
              value={desiredSubnets}
              onChange={(e) => setDesiredSubnets(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {results.error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{results.error}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key calculated metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-xs text-slate-400">New Subnet Prefix</div>
              <div className="text-xl font-mono font-bold text-indigo-400 mt-1">
                /{results.newCidr}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">+{results.bitsBorrowed} bits borrowed</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-xs text-slate-400">Total Subnets Created</div>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {results.totalSubnets}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">2^{results.bitsBorrowed} subnets</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-xs text-slate-400">Usable Hosts / Subnet</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {results.hostsPerSubnet}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Addresses per block</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-xs text-slate-400">New Subnet Mask</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1 truncate">
                {results.newSubnetMask}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dotted decimal mask</div>
            </div>
          </div>

          {/* Subnets table */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Generated Subnets Table ({results.subnetsList?.length} of {results.totalSubnets})
              </h4>
              <div className="flex items-center gap-2 text-xs">
                {results.hasMore && (
                  <button
                    onClick={() => setTableLimit((prev) => prev + 32)}
                    className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition text-xs"
                  >
                    Load More Rows
                  </button>
                )}
                <CopyButton
                  textToCopy={results.subnetsList
                    ?.map((s) => `#${s.index} Net: ${s.network}/${results.newCidr} | Range: ${s.range} | Bcast: ${s.broadcast}`)
                    .join('\n') || ''}
                  label="Copy All Rows"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0f19] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Network Address</th>
                    <th className="py-3 px-4">Usable Host Range</th>
                    <th className="py-3 px-4">Broadcast Address</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {results.subnetsList?.map((subnet) => (
                    <tr key={subnet.index} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 text-slate-500 font-sans">{subnet.index}</td>
                      <td className="py-2.5 px-4 font-semibold text-indigo-300">
                        {subnet.network}/{results.newCidr}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-400">{subnet.range}</td>
                      <td className="py-2.5 px-4 text-amber-400">{subnet.broadcast}</td>
                      <td className="py-2.5 px-4 text-right">
                        <CopyButton
                          textToCopy={`${subnet.network}/${results.newCidr} (Range: ${subnet.range})`}
                          variant="icon"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
