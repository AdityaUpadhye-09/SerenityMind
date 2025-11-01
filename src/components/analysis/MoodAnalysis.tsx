import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Heart, 
  Wind,
  TrendingUp
} from "lucide-react";

interface MoodAnalysisProps {
  entry: {
    mood_score: number;
    mental_state: string;
    ai_suggestions: string[];
    habits: string[];
    breathing_prompt: string;
  };
}

const getMoodColor = (state: string) => {
  const colors: Record<string, string> = {
    peaceful: "bg-peaceful",
    calm: "bg-peaceful",
    content: "bg-accent",
    motivated: "bg-motivated",
    energized: "bg-motivated",
    stressed: "bg-destructive",
    anxious: "bg-destructive",
    sad: "bg-muted",
    distracted: "bg-muted",
    overwhelmed: "bg-destructive",
  };
  return colors[state] || "bg-primary";
};

export const MoodAnalysis = ({ entry }: MoodAnalysisProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mood Score */}
      <Card className="backdrop-blur-glass border-border/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">Your Mood Score</h3>
            <p className="text-5xl font-bold mt-2">{entry.mood_score}</p>
          </div>
          <Badge className={`${getMoodColor(entry.mental_state)} text-lg px-4 py-2`}>
            {entry.mental_state}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`h-3 rounded-full ${getMoodColor(entry.mental_state)} transition-all duration-1000`}
            style={{ width: `${entry.mood_score}%` }}
          />
        </div>
      </Card>

      {/* AI Suggestions */}
      <Card className="backdrop-blur-glass border-border/50 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold">Self-Improvement Suggestions</h3>
        </div>
        <ul className="space-y-3">
          {entry.ai_suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{suggestion}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Daily Habits */}
      <Card className="backdrop-blur-glass border-border/50 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-peaceful" />
          <h3 className="text-xl font-bold">Daily Habits to Practice</h3>
        </div>
        <ul className="space-y-3">
          {entry.habits.map((habit, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-peaceful mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">{habit}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Breathing Prompt */}
      <Card className="backdrop-blur-glass border-border/50 p-8 breathe">
        <div className="flex items-center gap-2 mb-4">
          <Wind className="h-5 w-5 text-accent" />
          <h3 className="text-xl font-bold">Breathing Exercise</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">{entry.breathing_prompt}</p>
      </Card>
    </div>
  );
};
