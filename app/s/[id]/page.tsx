import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const riskColor = (s: number) => s >= 70 ? '#ef4444' : s >= 40 ? '#f59e0b' : '#34d399';

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

  return (
    <html lang={lang}>
      <head>
        <title>{job} — {score}% KI-Risiko | deadjob.ai</title>
        <meta name="description" content={`${job} hat ein ${score}% Automatisierungsrisiko laut deadjob.ai`} />
        <meta property="og:title" content={`${job} — ${score}% KI-Übernahmerisiko`} />
        <meta property="og:description" content={`Analysiert mit deadjob.ai — Wie sicher ist dein Job?`} />
        <meta property="og:url" content={`https://deadjob.ai/s/${params.id}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, background: '#080b14', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ maxWidth: 560, width: '100%' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <a href="https://deadjob.ai" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, textDecoration: 'none', color: '#fff' }}>
              dead<span style={{ color: '#6366f1' }}>job</span>.ai
            </a>
          </div>

          {/* Result Card */}
          <div style={{ background: '#0d1117', border: '1px solid #1e2535', borderRadius: 16, padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{job}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {data.sector === 'public' ? (lang === 'de' ? 'Öffentlicher Dienst' : 'Public sector') :
                   data.sector === 'self' ? (lang === 'de' ? 'Selbstständig' : 'Self-employed') :
                   (lang === 'de' ? 'Privatwirtschaft' : 'Private sector')} · {data.age_group} · {data.experience}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: riskColor(score), lineHeight: 1 }}>{score}%</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{lang === 'de' ? 'Automatisierungsrisiko' : 'Automation risk'}</div>
              </div>
            </div>

            {/* Bar */}
            <div style={{ background: '#1a1f2e', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${score}%`, background: `linear-gradient(90deg, #f59e0b, ${riskColor(score)})` }} />
            </div>

            {/* CTA */}
            <a href="https://deadjob.ai" style={{
              display: 'block', textAlign: 'center', background: '#6366f1', color: '#fff',
              borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600,
              textDecoration: 'none', marginTop: 8,
            }}>
              {lang === 'de' ? '🔍 Meinen Job analysieren → deadjob.ai' : '🔍 Analyze my job → deadjob.ai'}
            </a>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#4b5563' }}>
            © 2026 deadjob.ai
          </div>
        </div>
      </body>
    </html>
  );
}
