import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entryText } = await req.json();
    console.log('Analyzing mood for entry:', entryText);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a compassionate mental wellness AI assistant. Analyze the user's journal entry and provide:
1. A mood score (0-100, where 0 is very negative and 100 is very positive)
2. Mental state classification (choose one: stressed, anxious, motivated, sad, peaceful, distracted, content, energized, overwhelmed, calm)
3. 3-5 personalized self-improvement suggestions (short, actionable)
4. 3-5 daily habits/micro-tasks to improve mental state
5. A breathing or meditation prompt

Be empathetic, supportive, and encouraging. Focus on growth and self-compassion.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: entryText }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_mental_state',
              description: 'Analyze the mental state from journal entry',
              parameters: {
                type: 'object',
                properties: {
                  mood_score: {
                    type: 'number',
                    description: 'Mood score from 0-100'
                  },
                  mental_state: {
                    type: 'string',
                    enum: ['stressed', 'anxious', 'motivated', 'sad', 'peaceful', 'distracted', 'content', 'energized', 'overwhelmed', 'calm']
                  },
                  suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Self-improvement suggestions'
                  },
                  habits: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Daily habits and micro-tasks'
                  },
                  breathing_prompt: {
                    type: 'string',
                    description: 'Breathing or meditation guidance'
                  }
                },
                required: ['mood_score', 'mental_state', 'suggestions', 'habits', 'breathing_prompt'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_mental_state' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Parsed analysis:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-mood function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
