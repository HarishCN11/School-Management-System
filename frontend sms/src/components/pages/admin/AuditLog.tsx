import React from 'react';
import { History, ShieldCheck, Activity, Search } from 'lucide-react';

export const AuditLog = ({ onNavigate }: any) => {
  const steps = [
    { title: "Authentication Flow", desc: "Verifying secure login protocols", status: "Active" },
    { title: "Permission Mapping", desc: "Syncing role-based access control", status: "Active" },
    { title: "Audit Dispatcher", desc: "Initializing primary log stream", status: "Pending" }
  ];

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">System Trace</h1>
          <p className="text-slate-500 font-bold tracking-tight">Official administrative log for all school operations</p>
        </div>
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={18} />
            <input 
                type="text" 
                placeholder="Search logs by action or user..." 
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full md:w-80 font-semibold text-sm shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-slate-300"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-16 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40"></div>
                
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-10 shadow-inner border border-slate-100 mx-auto group hover:scale-105 transition-transform duration-500">
                        <History size={48} className="group-hover:rotate-[-45deg] transition-transform duration-700" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">Historical Vault Empty</h3>
                    <p className="text-slate-400 max-w-sm mb-12 font-bold leading-relaxed">
                        The security logs were recently purged during the system initialization. New administrative actions will appear here in real-time.
                    </p>
                    
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200">
                        Configure Filter Settings
                    </button>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/30">
                <ShieldCheck size={40} className="mb-6" />
                <h2 className="text-xl font-black mb-4">Integrity Guard</h2>
                <p className="text-sm font-bold text-blue-100 leading-relaxed opacity-80 italic">
                    "Every record in this log is cryptographically signed and immutable, ensuring the highest level of accountability."
                </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Activity size={18} />
                    Dispatcher Status
                </h3>
                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full ${step.status === 'Active' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200'}`}></div>
                                {i < steps.length - 1 && <div className="w-0.5 flex-grow bg-slate-100 my-1 group-hover:bg-blue-100 transition-colors"></div>}
                            </div>
                            <div className="pb-8">
                                <p className="text-sm font-black text-slate-800 leading-none">{step.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-1">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
