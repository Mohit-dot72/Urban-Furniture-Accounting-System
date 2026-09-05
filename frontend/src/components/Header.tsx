import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Armchair, Shield, UserCheck, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeRole, setActiveRole, resetToDefaultData, contacts, activeCustomerContactId, setActiveCustomerContactId } = useAccounting();

  const customerContacts = contacts.filter((c) => c.type === 'customer' || c.type === 'both');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Armchair className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-slate-100 tracking-tight">Urban Furniture</h1>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Accounting ERP
            </span>
          </div>
          <p className="text-xs text-slate-400">Double-Entry Financial Management System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <span className="text-xs font-medium text-slate-400 px-2.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            Role:
          </span>
          <button
            onClick={() => setActiveRole('admin')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveRole('accountant')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeRole === 'accountant'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Accountant
          </button>
          <button
            onClick={() => setActiveRole('contact')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeRole === 'contact'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer Portal
          </button>
        </div>

        {/* Customer Select dropdown if in contact role */}
        {activeRole === 'contact' && (
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={activeCustomerContactId || ''}
              onChange={(e) => setActiveCustomerContactId(e.target.value)}
              className="bg-transparent text-xs text-emerald-300 font-medium focus:outline-none cursor-pointer"
            >
              {customerContacts.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Demo Data button */}
        <button
          onClick={resetToDefaultData}
          title="Reset database to default seed state"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        {/* User profile avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 ring-2 ring-indigo-500/30">
            {activeRole === 'contact' ? 'CU' : activeRole === 'accountant' ? 'AC' : 'AD'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-slate-200">
              {activeRole === 'contact' ? 'Portal User' : activeRole === 'accountant' ? 'Senior Accountant' : 'System Admin'}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">{activeRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
