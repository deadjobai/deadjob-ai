'use client';

import { useState, useEffect } from 'react';

const SECTOR_OPTIONS = {
  de: [
    { value: 'private', label: 'Privatwirtschaft' },
    { value: 'public', label: 'Öffentlicher Dienst' },
    { value: 'self', label: 'Selbstständig' },
  ],
  en: [
    { value: 'private', label: 'Private sector' },
    { value: 'public', label: 'Public sector' },
    { value: 'self', label: 'Self-employed' },
  ],
};

const AGE_OPTIONS = ['18–25', '26–35', '36–45', '46–55', '55+'];
const EXP_OPTIONS = {
  de: ['0–3 Jahre', '3–10 Jahre', '10+ Jahre'],
  en: ['0–3 years', '3–10 years', '10+ years'],
};
const POPULAR = {
  de: ['Buchhalter', 'Arzt', 'Programmierer', 'LKW-Fahrer', 'Lehrer', 'Anwalt'],
  en: ['Accountant', 'Doctor', 'Developer', 'Truck Driver', 'Teacher', 'Lawyer'],
};
const LOADING_MESSAGES = {
  de: ['KI durchsucht Arbeitsmarktdaten...', 'Automatisierungsrisiko wird berechnet...', 'Zukunftsszenarien werden analysiert...', 'Weiterbildungsempfehlungen werden erstellt...', 'Ergebnis wird aufbereitet...'],
  en: ['AI scanning labor market data...', 'Calculating automation risk...', 'Analyzing future scenarios...', 'Creating training recommendations...', 'Preparing your result...'],
};
const PLATFORM_COLORS: Record<string, string> = {
  'Udemy': '#a78bfa', 'LinkedIn': '#60a5fa', 'Coursera': '#34d399',
  'Google': '#fbbf24', 'AMS': '#f87171', 'WKO': '#fb923c',
  'YouTube': '#f87171', 'default': '#6b7280',
};

const T = {
  de: {
    tagline: 'Übernimmt KI deinen Job? Finde es in 10 Sekunden heraus.',
    placeholder: 'z.B. Buchhalter, Arzt, Programmierer...',
    next: 'Weiter →', analyze: 'Jetzt analysieren', analyzing: 'KI analysiert...',
    popular: 'Beliebt:', where: 'Wo arbeitest du?', ageQ: 'Wie alt bist du?',
    expQ: 'Wie viel Erfahrung hast du?', risk: 'Automatisierungsrisiko',
    automated: 'Wird automatisiert', stays: 'Bleibt menschlich',
    timeline: 'Zeitleiste der Veränderung', reco: 'Persönliche Empfehlung',
    trainingToggle: '🎓 Weiterbildungsempfehlungen anzeigen',
    trainingToggleClose: '🎓 Weiterbildungsempfehlungen schließen',
    trainingHint: 'Suchbegriff kopieren und bei der Plattform eingeben',
    newRoles: 'Mögliche neue Berufsbilder',
    sponsored: '⭐ Gesponserte Empfehlung', sponsoredBadge: 'GESPONSERT',
    sponsoredCta: 'Jetzt ansehen →',
    sponsoredDisclaimer: 'Gesponserte Inhalte — von Kursanbietern bezahlt',
    share: '📋 Teilen & Link kopieren', copied: '✓ Link kopiert!',
    shareLink: '🔗 Direktlink zu diesem Ergebnis',
    linkCopied: '✓ Link kopiert!',
    newSearch: '↩ Neue Analyse', sectorL: 'Sektor', ageL: 'Alter', expL: 'Erfahrung',
    back: '←', shareTitle: 'Teile dein Ergebnis', copyTerm: 'kopieren', termCopied: '✓',
    statsTitle: '🔥 Die risikoreichsten Jobs laut unseren Nutzern',
    statsSubtitle: 'Eingaben unserer Nutzer',
    statsSearches: 'Analysen',
    statsRisk: 'Ø Risiko',
  },
  en: {
    tagline: 'Will AI take your job? Find out in 10 seconds.',
    placeholder: 'e.g. Accountant, Doctor, Developer...',
    next: 'Next →', analyze: 'Analyze now', analyzing: 'AI analyzing...',
    popular: 'Popular:', where: 'Where do you work?', ageQ: 'How old are you?',
    expQ: 'How much experience do you have?', risk: 'Automation risk',
    automated: 'Will be automated', stays: 'Stays human',
    timeline: 'Timeline of change', reco: 'Personal recommendation',
    trainingToggle: '🎓 Show training recommendations',
    trainingToggleClose: '🎓 Hide training recommendations',
    trainingHint: 'Copy a search term and enter it on the platform',
    newRoles: 'Possible new job profiles',
    sponsored: '⭐ Sponsored recommendation', sponsoredBadge: 'SPONSORED',
    sponsoredCta: 'View now →',
    sponsoredDisclaimer: 'Sponsored content — paid by course providers',
    share: '📋 Share & copy link', copied: '✓ Link copied!',
    shareLink: '🔗 Direct link to this result',
    linkCopied: '✓ Link copied!',
    newSearch: '↩ New analysis', sectorL: 'Sector', ageL: 'Age', expL: 'Experience',
    back: '←', shareTitle: 'Share your result', copyTerm: 'copy', termCopied: '✓',
    statsTitle: '🔥 Most at-risk jobs according to our users',
    statsSubtitle: 'As entered by users',
    statsSearches: 'analyses',
    statsRisk: 'Avg risk',
  },
};

const riskColor = (s: number) => s >= 70 ? '#ef4444' : s >= 40 ? '#f59e0b' : '#34d399';

// Schärferer Share-Text
const generateShareText = (result: any, lang: 'de' | 'en', shareUrl: string) => {
  const score = result.risk_score;
  const job = result.job;
  const year = result.critical_year || '2030';

  if (lang === 'de') {
    if (score >= 75) return `Mein Job als ${job} stirbt ${year}.\nKI übernimmt ${score}% meiner Aufgaben — laut deadjob.ai\n\nWas ist dein Score? → ${shareUrl}`;
    if (score >= 50) return `${score}% meines Jobs als ${job} macht bald die KI.\nNoch bin ich da — aber die Uhr tickt. ⏳\n\nCHECK DEINEN JOB → ${shareUrl}`;
    if (score >= 25) return `Nur ${score}% KI-Risiko als ${job}.\nFast KI-proof — fast. 😅\n\nBist du sicherer? → ${shareUrl}`;
    return `KI-PROOF! Nur ${score}% Automatisierungsrisiko als ${job}. 💪\nManche Jobs überlebt man eben.\n\nCheck deinen → ${shareUrl}`;
  } else {
    if (score >= 75) return `My job as ${job} dies in ${year}.\nAI takes over ${score}% of my work — according to deadjob.ai\n\nWhat's your score? → ${shareUrl}`;
    if (score >= 50) return `${score}% of my ${job} job will soon be done by AI.\nStill here for now — but the clock is ticking. ⏳\n\nCHECK YOUR JOB → ${shareUrl}`;
    if (score >= 25) return `Only ${score}% AI risk as a ${job}.\nAlmost AI-proof — almost. 😅\n\nAre you safer? → ${shareUrl}`;
    return `AI-PROOF! Only ${score}% automation risk as a ${job}. 💪\nSome jobs just survive.\n\nCheck yours → ${shareUrl}`;
  }
};

function LoadingAnimation({ lang }: { lang: 'de' | 'en' }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const messages = LOADING_MESSAGES[lang];
  useEffect(() => {
    const pi = setInterval(() => setProgress(p => p >= 90 ? p : p + (90 - p) * 0.04), 200);
    const mi = setInterval(() => setMsgIndex(p => (p + 1) % messages.length), 3000);
    return () => { clearInterval(pi); clearInterval(mi); };
  }, [messages.length]);
  return (
    <div style={{ marginTop: 24, padding: '20px 0' }}>
      <style>{`
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.7}}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0);opacity:0.3}40%{transform:translateY(-6px);opacity:1}}
        .pulse-icon{animation:pulse 1.5s ease-in-out infinite;display:inline-block}
        .dot1{animation:dotBounce 1.2s ease-in-out infinite 0s}
        .dot2{animation:dotBounce 1.2s ease-in-out infinite 0.2s}
        .dot3{animation:dotBounce 1.2s ease-in-out infinite 0.4s}
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span className="pulse-icon" style={{ fontSize: 40 }}>🤖</span>
      </div>
      <div style={{ background: '#1a1f2e', borderRadius: 999, height: 6, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', borderRadius: 999, width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: 11, color: '#4b5563', marginBottom: 12 }}>{Math.round(progress)}%</div>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#6366f1', fontWeight: 500, minHeight: 20 }}>{messages[msgIndex]}</div>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        {['dot1', 'dot2', 'dot3'].map(cls => (
          <span key={cls} className={cls} style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#6366f1', margin: '0 3px' }} />
        ))}
      </div>
    </div>
  );
}

// Stats Component
function StatsSection({ lang }: { lang: 'de' | 'en' }) {
  const [stats, setStats] = useState<any[]>([]);
  const t = T[lang];

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d.stats || []))
      .catch(() => {});
  }, []);

  if (stats.length === 0) return null;

  return (
    <div style={{ marginTop: 40, background: '#0d1117', border: '1px solid #1e2535', borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{t.statsTitle}</div>
      <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 16 }}>{t.statsSubtitle}</div>
      {stats.map((s: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '10px 12px', background: '#080b14', borderRadius: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#4b5563', minWidth: 24 }}>#{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', textTransform: 'capitalize' }}>{s.job_normalized}</div>
            <div style={{ fontSize: 11, color: '#4b5563' }}>{s.count} {t.statsSearches}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: riskColor(Math.round(s.avg_risk)) }}>{Math.round(s.avg_risk)}%</div>
            <div style={{ fontSize: 10, color: '#4b5563' }}>{t.statsRisk}</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `conic-gradient(${riskColor(Math.round(s.avg_risk))} ${Math.round(s.avg_risk)}%, #1e2535 0)` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer({ lang }: { lang: 'de' | 'en' }) {
  return (
    <footer style={{ maxWidth: 620, margin: '40px auto 0', padding: '20px 16px', borderTop: '1px solid #1e2535', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
      <span style={{ fontSize: 12, color: '#4b5563' }}>© 2026 dead<span style={{ color: '#6366f1' }}>job</span>.ai</span>
      <a href="mailto:contact@deadjob.ai" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', background: '#0d1117', border: '1px solid #1e2535', borderRadius: 8, padding: '6px 14px' }}>
        {lang === 'de' ? '✉ Kontakt' : '✉ Contact'}
      </a>
    </footer>
  );
}

export default function Home() {
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [step, setStep] = useState(1);
  const [job, setJob] = useState('');
  const [sector, setSector] = useState('');
  const [age, setAge] = useState('');
  const [exp, setExp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copiedTerms, setCopiedTerms] = useState<Record<number, boolean>>({});
  const [shareText, setShareText] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [trainingOpen, setTrainingOpen] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language || 'de';
    setLang(browserLang.startsWith('de') ? 'de' : 'en');
  }, []);

  const t = T[lang];

  const analyze = async () => {
    if (!sector || !age || !exp) return;
    setLoading(true);
    setResult(null);
    setTrainingOpen(false);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, sector, age, exp, lang }),
      });
      const data = await res.json();
      const url = `${window.location.origin}/s/${data.shareId}`;
      setShareUrl(url);
      setResult(data);
      setShareText(generateShareText(data, lang, url));
      setStep(3);
    } catch { console.error('Analysis failed'); }
    setLoading(false);
  };

  const copyTerm = (term: string, idx: number) => {
    navigator.clipboard.writeText(term);
    setCopiedTerms(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => setCopiedTerms(prev => ({ ...prev, [idx]: false })), 2000);
  };

  const reset = () => {
    setStep(1); setJob(''); setSector(''); setAge('');
    setExp(''); setResult(null); setCopied(false);
    setCopiedTerms({}); setTrainingOpen(false); setShareUrl('');
  };

  const optBtn = (val: string, cur: string, set: (v: string) => void, label: string, minW = 80) => (
    <button key={val} onClick={() => set(val)} style={{
      flex: 1, minWidth: minW, padding: '11px 6px', borderRadius: 10, cursor: 'pointer',
      fontSize: 'clamp(12px, 2.5vw, 13px)', fontWeight: 500,
      border: `1px solid ${cur === val ? '#6366f1' : '#1e2535'}`,
      background: cur === val ? '#1a1a3e' : '#080b14',
      color: cur === val ? '#818cf8' : '#6b7280',
    }}>{label}</button>
  );

  const card: React.CSSProperties = { background: '#0d1117', border: '1px solid #1e2535', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)' };

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '24px 16px' }}>
      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .training-panel{animation:slideDown 0.25s ease}
      `}</style>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Lang */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {(['de', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ padding: '4px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: lang === l ? '#6366f1' : '#1a1f2e', color: lang === l ? '#fff' : '#6b7280' }}>{l.toUpperCase()}</button>
          ))}
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: 900, letterSpacing: -2, marginBottom: 6, lineHeight: 1 }}>
          dead<span style={{ color: '#6366f1' }}>job</span>.ai
        </div>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 'clamp(13px, 3vw, 15px)', marginBottom: 32, padding: '0 8px' }}>{t.tagline}</p>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={job} onChange={e => setJob(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && job.trim() && setStep(2)}
                placeholder={t.placeholder} autoFocus
                style={{ flex: 1, background: '#0f1420', border: '1px solid #1e2535', borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 'clamp(14px, 3vw, 15px)', outline: 'none' }}
              />
              <button onClick={() => job.trim() && setStep(2)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 20px', fontSize: 'clamp(14px, 3vw, 15px)', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t.next}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#4b5563', fontSize: 12 }}>{t.popular}</span>
              {POPULAR[lang].map(p => (
                <button key={p} onClick={() => { setJob(p); setStep(2); }} style={{ background: '#0f1420', border: '1px solid #1e2535', borderRadius: 20, padding: '5px 12px', fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#6b7280', cursor: 'pointer' }}>{p}</button>
              ))}
            </div>
            <StatsSection lang={lang} />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <button onClick={() => setStep(1)} style={{ background: '#1a1f2e', border: 'none', color: '#6b7280', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 14 }}>{t.back}</button>
              <span style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700 }}>{job}</span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{t.where}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {SECTOR_OPTIONS[lang].map(s => optBtn(s.value, sector, setSector, s.label, 100))}
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{t.ageQ}</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {AGE_OPTIONS.map(a => optBtn(a, age, setAge, a, 55))}
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{t.expQ}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {EXP_OPTIONS[lang].map(e => optBtn(e, exp, setExp, e, 90))}
            </div>
            <button onClick={analyze} disabled={!sector || !age || !exp || loading} style={{
              width: '100%', border: 'none', borderRadius: 10, padding: '15px',
              fontSize: 'clamp(14px, 3vw, 15px)', fontWeight: 600,
              cursor: (!sector || !age || !exp) ? 'not-allowed' : 'pointer',
              background: (!sector || !age || !exp || loading) ? '#1a1f2e' : '#6366f1',
              color: (!sector || !age || !exp || loading) ? '#4b5563' : '#fff',
            }}>
              {loading ? t.analyzing : t.analyze}
            </button>
            {loading && <LoadingAnimation lang={lang} />}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && result && (
          <div style={card}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                <div style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800 }}>{result.job}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>{result.sector_note}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 'clamp(42px, 10vw, 56px)', fontWeight: 900, color: riskColor(result.risk_score), lineHeight: 1 }}>{result.risk_score}%</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>{t.risk}</div>
              </div>
            </div>

            {/* Bar */}
            <div style={{ background: '#1a1f2e', borderRadius: 999, height: 6, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${result.risk_score}%`, background: `linear-gradient(90deg, #f59e0b, ${riskColor(result.risk_score)})` }} />
            </div>

            <p style={{ color: '#9ca3af', fontSize: 'clamp(13px, 3vw, 14px)', lineHeight: 1.7, marginBottom: 16 }}>{result.verdict}</p>
            <div style={{ borderBottom: '1px solid #1e2535', marginBottom: 16 }} />

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 8 }}>⚠ {t.automated}</div>
                {result.what_changes?.map((item: string, i: number) => (
                  <div key={i} style={{ color: '#6b7280', fontSize: 'clamp(12px, 2.5vw, 13px)', marginBottom: 6, lineHeight: 1.4 }}>• {item}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#34d399', marginBottom: 8 }}>✓ {t.stays}</div>
                {result.what_stays?.map((item: string, i: number) => (
                  <div key={i} style={{ color: '#6b7280', fontSize: 'clamp(12px, 2.5vw, 13px)', marginBottom: 6, lineHeight: 1.4 }}>• {item}</div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {result.timeline && (
              <div style={{ background: '#080b14', borderRadius: 10, padding: '14px 12px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>{t.timeline}</div>
                <div style={{ display: 'flex' }}>
                  {result.timeline.map((s: any, i: number) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      {i < result.timeline.length - 1 && (
                        <div style={{ position: 'absolute', top: 9, left: '50%', width: '100%', height: 1, background: '#1e2535', zIndex: 0 }} />
                      )}
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.color || '#6366f1', margin: '0 auto 6px', position: 'relative', zIndex: 1 }} />
                      <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: '#6b7280' }}>{s.year}</div>
                      <div style={{ fontSize: 'clamp(8px, 1.8vw, 10px)', color: '#4b5563', marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div style={{ background: '#080b14', borderLeft: '3px solid #6366f1', borderRadius: '0 10px 10px 0', padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, marginBottom: 6 }}>💡 {t.reco}</div>
              <div style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#9ca3af', lineHeight: 1.6 }}>{result.recommendation}</div>
              {result.new_roles?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 6 }}>{t.newRoles}:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {result.new_roles.map((role: string, i: number) => (
                      <span key={i} style={{ background: '#1a1a3e', border: '1px solid #312e81', borderRadius: 20, padding: '3px 10px', fontSize: 'clamp(10px, 2vw, 11px)', color: '#818cf8' }}>{role}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Training toggle */}
            {(result.training?.length > 0 || result.sponsoredCourse) && (
              <button onClick={() => setTrainingOpen(!trainingOpen)} style={{
                width: '100%', border: `1px solid ${trainingOpen ? '#fbbf24' : '#1e2535'}`,
                borderRadius: 10, borderBottomLeftRadius: trainingOpen ? 0 : 10,
                borderBottomRightRadius: trainingOpen ? 0 : 10,
                padding: '14px 16px', marginBottom: trainingOpen ? 0 : 16,
                fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: 600, cursor: 'pointer',
                background: trainingOpen ? '#1a130a' : '#080b14',
                color: trainingOpen ? '#fbbf24' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>{trainingOpen ? t.trainingToggleClose : t.trainingToggle}</span>
                <span style={{ fontSize: 16, transform: trainingOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>▼</span>
              </button>
            )}

            {trainingOpen && (
              <div className="training-panel" style={{ background: '#080b14', border: '1px solid #fbbf24', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 16, marginBottom: 16 }}>
                {result.sponsoredCourse && (
                  <div style={{ background: '#0a0f1a', border: '1px solid #2d2a1e', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>{t.sponsored}</div>
                      <span style={{ fontSize: 9, background: '#2d2a1e', color: '#92400e', border: '1px solid #92400e', borderRadius: 4, padding: '2px 6px' }}>{t.sponsoredBadge}</span>
                    </div>
                    <div style={{ fontSize: 'clamp(14px, 3vw, 15px)', fontWeight: 700, color: '#fff', marginBottom: 4 }}>{result.sponsoredCourse.course_title}</div>
                    <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 8 }}>{result.sponsoredCourse.provider_name}</div>
                    {result.sponsoredCourse.description && (
                      <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5, marginBottom: 12 }}>{result.sponsoredCourse.description}</div>
                    )}
                    <a href={result.sponsoredCourse.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-block', background: '#fbbf24', color: '#000', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                      {t.sponsoredCta}
                    </a>
                    <div style={{ fontSize: 10, color: '#4b5563', marginTop: 8 }}>{t.sponsoredDisclaimer}</div>
                  </div>
                )}
                {result.training?.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>{t.trainingHint}</div>
                    {result.training.map((item: any, i: number) => {
                      const platformColor = PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.default;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, padding: '10px 12px', background: '#0d1117', borderRadius: 8, border: '1px solid #1e2535' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>🔍 {item.term}</span>
                              <span style={{ fontSize: 10, background: '#1a1f2e', border: `1px solid ${platformColor}`, color: platformColor, borderRadius: 20, padding: '2px 8px' }}>{item.platform}</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{item.why}</div>
                          </div>
                          <button onClick={() => copyTerm(item.term, i)} style={{ background: copiedTerms[i] ? '#0a2a0a' : '#1a1f2e', color: copiedTerms[i] ? '#34d399' : '#6b7280', border: '1px solid #1e2535', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {copiedTerms[i] ? t.termCopied : t.copyTerm}
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Context badges */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { l: t.sectorL, v: SECTOR_OPTIONS[lang].find(s => s.value === sector)?.label },
                { l: t.ageL, v: age },
                { l: t.expL, v: exp },
              ].map((b, i) => (
                <div key={i} style={{ background: '#0f1420', border: '1px solid #1e2535', borderRadius: 8, padding: '5px 10px', fontSize: 11 }}>
                  <span style={{ color: '#4b5563' }}>{b.l}: </span>
                  <span style={{ color: '#9ca3af' }}>{b.v}</span>
                </div>
              ))}
            </div>

            {/* Share Box */}
            <div style={{ background: '#080b14', border: '1px solid #1e2535', borderRadius: 12, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>✨ {t.shareTitle}</div>

              {/* Direct link */}
              {shareUrl && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#0d1117', border: '1px solid #1e2535', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#6366f1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shareUrl}
                  </div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2500);
                  }} style={{ background: linkCopied ? '#0a2a0a' : '#1a1f2e', color: linkCopied ? '#34d399' : '#6b7280', border: '1px solid #1e2535', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {linkCopied ? '✓' : '🔗'}
                  </button>
                </div>
              )}

              {/* Share text */}
              <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#9ca3af', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 12, border: '1px solid #1e2535' }}>
                {shareText}
              </div>
              <button onClick={() => {
                navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }} style={{
                width: '100%', border: 'none', borderRadius: 10, padding: 14,
                fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: 600, cursor: 'pointer',
                background: copied ? '#0a2a0a' : '#6366f1',
                color: copied ? '#34d399' : '#fff',
              }}>
                {copied ? t.copied : t.share}
              </button>
            </div>

            <button onClick={reset} style={{ background: 'transparent', color: '#6b7280', border: '1px solid #1e2535', borderRadius: 10, padding: '12px', fontSize: 13, cursor: 'pointer', width: '100%' }}>
              {t.newSearch}
            </button>
          </div>
        )}
      </div>
      <Footer lang={lang} />
    </main>
  );
}
