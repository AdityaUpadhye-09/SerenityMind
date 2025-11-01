import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";

export const MoodHistory = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading history...</div>;
  }

  if (entries.length === 0) {
    return (
      <Card className="backdrop-blur-glass border-border/50 p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No entries yet. Start journaling to track your mood!</p>
      </Card>
    );
  }

  const averageScore = Math.round(
    entries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / entries.length
  );

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-glass border-border/50 p-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="text-xl font-bold">Your Progress</h3>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">7-Day Average Mood</p>
          <p className="text-5xl font-bold text-primary">{averageScore}</p>
        </div>
      </Card>

      <Card className="backdrop-blur-glass border-border/50 p-8">
        <h3 className="text-xl font-bold mb-4">Recent Entries</h3>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                </p>
                <p className="font-medium capitalize">{entry.mental_state}</p>
              </div>
              <div className="text-2xl font-bold">{entry.mood_score}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
