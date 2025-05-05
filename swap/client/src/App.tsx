import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleProvider } from "./context/ScheduleContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";

// Custom hook to detect the base location for the router
const useBasePath = () => {
  const [base, setBase] = useState("");
  
  useEffect(() => {
    // Check if we're on GitHub Pages or in development
    const isGitHubPages = window.location.hostname === "adityasood.me";
    const localPath = window.location.pathname;
    
    // If on GitHub Pages or path includes /swap, use /swap as base
    if (isGitHubPages || localPath.includes("/swap")) {
      setBase("/swap");
    }
  }, []);

  return base;
};

function Router() {
  const base = useBasePath();
  
  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScheduleProvider>
          <div className="flex flex-col min-h-screen">
            <Toaster />
            <Router />
            <Footer />
          </div>
        </ScheduleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
