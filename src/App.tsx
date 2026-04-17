
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NotFound404 from "./pages/NotFound404";
import Useful from "./pages/Useful";
import UsefulYandex from "./pages/UsefulYandex";
import UsefulArticle from "./pages/UsefulArticle";
import AdGenerator from "./pages/AdGenerator";
import UsefulVk from "./pages/UsefulVk";
import VkAdGenerator from "./pages/VkAdGenerator";
import UsefulYandexQA from "./pages/UsefulYandexQA";
import ReportBuilder from "./pages/ReportBuilder";
import ReportView from "./pages/ReportView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/useful" element={<Useful />} />
          <Route path="/useful/yandex" element={<UsefulYandex />} />
          <Route path="/useful/article/:slug" element={<UsefulArticle />} />
          <Route path="/useful/ad-generator" element={<AdGenerator />} />
          <Route path="/useful/vk" element={<UsefulVk />} />
          <Route path="/useful/vk-ad-generator" element={<VkAdGenerator />} />
          <Route path="/useful/yandex/qa" element={<UsefulYandexQA />} />
          <Route path="/useful/report-builder" element={<ReportBuilder />} />
          <Route path="/report/:id" element={<ReportView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;