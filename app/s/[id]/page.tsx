export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const riskColor = (s: number) => s >= 70 ? '#ef4444' : s >= 40 ? '#f59e0b' : '#34d399';
const riskLabel = (s: number, lang: string) => {
  if (lang === 'de') return s >= 70 ? 'Hohes Risiko' : s >= 40 ? 'Mittleres Risiko' : 'Niedriges Risiko';
  return s >= 70 ? 'High risk' : s >= 40 ? 'Medium risk' : 'Low risk';
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data } = await supabase
    .from('job_analyses')
    .select('job_original, risk_score, language')
    .eq('share_id', params.id)
    .single();

  if (!data) return { title: 'deadjob.ai' };

  return {
    title: `${data.job_original} — ${data.risk_score}% KI-Risiko | deadjob.ai`,
    description: `${data.job_original} hat ein ${data.risk_score}% Automatisierungsrisiko laut deadjob.ai`,
    openGraph: {
      title: `${data.job_original} — ${data.risk_score}% KI-Übernahmerisiko`,
      description: `Analysiert mit deadjob.ai`,
      url: `https://deadjob.ai/s/${params.id}`,
    },
  };
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const { data } = await supabase
    .from('job_analyses')
    .select('*')
    .eq('share_id', params.id)
    .eq('is_public', true)
    .single();

  if (!data) return notFound();

  const lang = data.language || 'de';
  const score = data.risk_score;
  const job = data.job_original;

  const sectorLabel = {
    private: lang === 'de' ? 'Privatwirtschaft' : 'Private sector',
    public: lang === 'de' ? 'Öffentlicher Dienst' : 'Public sector',
    self: lang === 'de' ? 'Selbstständig' : 'Self-employed',
  }[data.sector as string] ?? '';

  return (
    <main style={{
      minHeight: '100vh', background: '#080b14', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px 16px',
    }}>
      {/* Logo */}
      <Link href="https://deadjob.ai" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, textDecoration: 'none', color: '#fff', marginBottom: 32 }}>
        dead<span style={{ color: '#6366f1' }}>job</span>.ai
      </Link>

      {/* Card */}
      <div style={{ maxWidth: 520, width: '100%', background: '#0d1117', border: '1px solid #1e2535', borderRadius: 16, padding: 28 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{job}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              {[sectorLabel, data.age_group, data.experience].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: riskColor(score), lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              {lang === 'de' ? 'Automatisierungsrisiko' : 'Automation risk'}
            </div>
          </div>
        </div>

        {/* Bar */}
        <div style={{ background: '#1a1f2e', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', borderRadius: 999, width: `${score}%`, background: `linear-gradient(90deg, #f59e0b, ${riskColor(score)})` }} />
        </div>

        {/* Risk label */}
        <div style={{ display: 'inline-block', background: `${riskColor(score)}20`, border: `1px solid ${riskColor(score)}40`, color: riskColor(score), borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          {riskLabel(score, lang)}
        </div>

        {/* Divider */}
        <div style={{ borderBottom: '1px solid #1e2535', marginBottom: 20 }} />

        {/* CTA */}
        <Link href="https://deadjob.ai" style={{
          display: 'block', textAlign: 'center', background: '#6366f1', color: '#fff',
          borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600,
          textDecoration: 'none',
        }}>
          {lang === 'de' ? '🔍 Meinen Job analysieren → deadjob.ai' : '🔍 Analyze my job → deadjob.ai'}
        </Link>
      </div>

      <div style={{ marginTop: 24, fontSize: 12, color: '#4b5563' }}>
        © 2026 deadjob.ai
      </div>
    </main>
  );
}
