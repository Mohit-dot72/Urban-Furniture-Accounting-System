import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-5 bg-background">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
