import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface JournalEntryProps {
  onAnalysisComplete: (entry: any) => void;
}

export const JournalEntry = ({ onAnalysisComplete }: JournalEntryProps) => {
  const [entryText, setEntryText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryText.trim()) return;

    setAnalyzing(true);
    try {
      // Call the analyze-mood edge function
      const { data: analysis, error: functionError } = await supabase.functions.invoke(
        'analyze-mood',
        {
          body: { entryText },
        }
      );

      if (functionError) throw functionError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save to database
      const { data: entry, error: dbError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_text: entryText,
          mood_score: analysis.mood_score,
          mental_state: analysis.mental_state,
          ai_suggestions: analysis.suggestions,
          habits: analysis.habits,
          breathing_prompt: analysis.breathing_prompt,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Entry saved!",
        description: "Your mood has been analyzed.",
      });

      onAnalysisComplete(entry);
      setEntryText("");
    } catch (error: any) {
      console.error('Error analyzing entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze entry",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="backdrop-blur-glass rounded-2xl p-8 shadow-2xl border border-border/50 glow-pulse">
      <h2 className="text-2xl font-bold mb-4">How are you feeling today?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Express your thoughts and emotions freely... There's no judgment here."
          className="min-h-[200px] resize-none"
          disabled={analyzing}
        />
        <Button
          type="submit"
          disabled={analyzing || !entryText.trim()}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing your emotions...
            </>
          ) : (
            "Analyze My Mood"
          )}
        </Button>
      </form>
    </div>
  );
};
