import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import IntervieweePage from "./pages/IntervieweePage";
import InterviewerPage from "./pages/InterviewerPage";
import NotFound from "./pages/NotFound";
import { UserCircle, Users } from "lucide-react";

const queryClient = new QueryClient();

const Navigation = () => (
  <nav className="border-b bg-card">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-primary">AI Interview Assistant</h1>
      <div className="flex gap-2">
        <Button asChild variant="ghost">
          <Link to="/interviewee">
            <UserCircle className="mr-2 h-4 w-4" />
            Candidate
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/interviewer">
            <Users className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  </nav>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<IntervieweePage />} />
          <Route path="/interviewee" element={<IntervieweePage />} />
          <Route path="/interviewer" element={<InterviewerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
