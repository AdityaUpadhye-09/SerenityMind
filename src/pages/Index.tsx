import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { JournalEntry } from "@/components/journal/JournalEntry";
import { MoodAnalysis } from "@/components/analysis/MoodAnalysis";
import { MoodHistory } from "@/components/history/MoodHistory";
import { Button } from "@/components/ui/button";
import { LogOut, Brain } from "lucide-react";
import heroImage from "@/assets/hero-wellness.jpg";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentEntry(null);
    setShowHistory(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-peaceful/20 rounded-full blur-3xl animate-pulse float" style={{ animationDelay: '2s' }} />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center mb-12 breathe">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-12 w-12 text-primary" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-peaceful bg-clip-text text-transparent">
                SerenityMind
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered companion for mental wellness and self-improvement.
              Track emotions, gain insights, and grow emotionally.
            </p>
          </div>
          <AuthForm onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse float" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-peaceful/10 rounded-full blur-3xl animate-pulse float" style={{ animationDelay: '3s' }} />
      
      {/* Header */}
      <header className="relative z-10 backdrop-blur-glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">SerenityMind</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "New Entry" : "View History"}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {showHistory ? (
          <MoodHistory />
        ) : (
          <div className="space-y-8">
            <JournalEntry 
              onAnalysisComplete={(entry) => {
                setCurrentEntry(entry);
                setShowHistory(false);
              }} 
            />
            {currentEntry && <MoodAnalysis entry={currentEntry} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
