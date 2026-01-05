import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import Index from "./pages/Index";
import GamesPage from "./pages/GamesPage";
import GamePlayPage from "./pages/GamePlayPage";
import CharactersPage from "./pages/CharactersPage";
import LearnPage from "./pages/LearnPage";
import AchievementsPage from "./pages/AchievementsPage";
import RedeemPage from "./pages/RedeemPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/game/:gameId" element={<GamePlayPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/redeem" element={<RedeemPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </GameProvider>
  </QueryClientProvider>
);

export default App;
