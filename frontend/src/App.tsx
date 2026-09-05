import React, { useState } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Header } from './components/Header';
import { Sidebar, type NavTab } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { PurchaseOrdersView } from './components/views/PurchaseOrdersView';
import { VendorBillsView } from './components/views/VendorBillsView';
import { SalesOrdersView } from './components/views/SalesOrdersView';
import { CustomerInvoicesView } from './components/views/CustomerInvoicesView';
import { PaymentsView } from './components/views/PaymentsView';
import { JournalEntriesView } from './components/views/JournalEntriesView';
import { ChartOfAccountsView } from './components/views/ChartOfAccountsView';
import { ContactsView } from './components/views/ContactsView';
import { ProductsView } from './components/views/ProductsView';
import { BudgetsView } from './components/views/BudgetsView';
import { ReportsView } from './components/views/ReportsView';

const MainLayout: React.FC = () => {
  const { activeRole } = useAccounting();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // If role switched to contact portal and currentTab is an admin-only tab, switch to customer-invoices
  React.useEffect(() => {
    if (activeRole === 'contact') {
      if (currentTab !== 'customer-invoices' && currentTab !== 'payments' && currentTab !== 'products') {
        setCurrentTab('customer-invoices');
      }
    }
  }, [activeRole, currentTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />}
          {currentTab === 'purchase-orders' && <PurchaseOrdersView />}
          {currentTab === 'vendor-bills' && <VendorBillsView />}
          {currentTab === 'sales-orders' && <SalesOrdersView />}
          {currentTab === 'customer-invoices' && <CustomerInvoicesView />}
          {currentTab === 'payments' && <PaymentsView />}
          {currentTab === 'journal-entries' && <JournalEntriesView />}
          {currentTab === 'chart-of-accounts' && <ChartOfAccountsView />}
          {currentTab === 'contacts' && <ContactsView />}
          {currentTab === 'products' && <ProductsView />}
          {currentTab === 'budgets' && <BudgetsView />}
          {currentTab === 'reports' && <ReportsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <MainLayout />
    </AccountingProvider>
  );
}
