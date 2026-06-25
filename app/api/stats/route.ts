import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('job_analyses')
      .select('job_normalized, risk_score')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    // Aggregieren
    const jobMap: Record<string, { count: number; totalRisk: number }> = {};
    for (const row of data || []) {
      const key = row.job_normalized;
      if (!jobMap[key]) jobMap[key] = { count: 0, totalRisk: 0 };
      jobMap[key].count++;
      jobMap[key].totalRisk += row.risk_score;
    }

    const stats = Object.entries(jobMap)
      .map(([job, d]) => ({
        job_normalized: job,
        count: d.count,
        avg_risk: Math.round(d.totalRisk / d.count),
      }))
      .filter(s => s.count >= 1)
      .sort((a, b) => b.avg_risk - a.avg_risk)
      .slice(0, 10);

    return NextResponse.json({ stats });
  } catch (e) {
    return NextResponse.json({ stats: [] });
  }
}
