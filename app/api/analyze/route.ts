import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  const { job, sector, age, exp, lang, session_id } = await req.json();
  if (!job) return NextResponse.json({ error: 'No job provided' }, { status: 400 });

  const country = req.headers.get('x-vercel-ip-country') || 'unknown';
  const region = req.headers.get('x-vercel-ip-country-region') || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  const device_type = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop';
  const referrer = req.headers.get('referer') || 'direct';
  const getRiskCategory = (score: number) =>
    score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  const sectorContext = {
    private: lang === 'de'
      ? 'Privatwirtschaft: hoher Kostendruck, schnelle KI-Adoption, direktes Automatisierungsrisiko'
      : 'Private sector: high cost pressure, fast AI adoption, direct automation risk',
    public: lang === 'de'
      ? 'Öffentlicher Dienst: Beamtenschutz, langsamere Automatisierung (5-10 Jahre Verzögerung), aber wachsender Digitalisierungsdruck'
      : 'Public sector: civil servant protection, slower automation (5-10 year delay), but growing digitalization pressure',
    self: lang === 'de'
      ? 'Selbstständig: direkter Wettbewerb mit KI-Tools, aber Chance zur Neupositionierung als KI-gestützter Spezialist'
      : 'Self-employed: direct competition with AI tools, but opportunity to reposition as AI-powered specialist',
  }[sector as string] ?? '';

  const prompt = lang === 'de'
    ? `Du bist ein Experte für Arbeitsmarkt und KI-Automatisierung. Analysiere den Beruf "${job}" für folgende Person:
- Sektor: ${sectorContext}
- Alter: ${age} Jahre
- Berufserfahrung: ${exp}

Wichtige Regeln:
- Öffentlicher Dienst: risk_score um 15-25 Punkte NIEDRIGER wegen Beamtenschutz
- Alter 55+: Empfehlung auf KI-Tool-Nutzung fokussiert, KEINE komplette Umschulung
- Alter 18-35: mutige neue Berufsbilder empfehlen
- Alter 36-54: gezielte Weiterbildung und Hybridrolle
- Selbstständig: Differenzierung und Premiumpositionierung

Bei den Weiterbildungen: Gib KONKRETE Suchbegriffe die jemand bei Google, Udemy, LinkedIn Learning oder dem AMS eingeben kann.

Antworte NUR mit einem JSON-Objekt, kein Text davor oder danach, keine Backticks:
{
  "job": "${job}",
  "risk_score": <Zahl 0-100>,
  "critical_year": "<Jahr z.B. 2029>",
  "sector_note": "<1 Satz über Sektoreinfluss>",
  "verdict": "<2-3 Sätze personalisiert>",
  "what_changes": ["<Aufgabe 1>", "<Aufgabe 2>", "<Aufgabe 3>", "<Aufgabe 4>", "<Aufgabe 5>"],
  "what_stays": ["<Fähigkeit 1>", "<Fähigkeit 2>", "<Fähigkeit 3>", "<Fähigkeit 4>", "<Fähigkeit 5>"],
  "timeline": [
    {"year": "2025", "label": "KI-Assistenz", "color": "#6366f1"},
    {"year": "2027", "label": "<was passiert>", "color": "#f59e0b"},
    {"year": "2030", "label": "<was passiert>", "color": "#ef4444"},
    {"year": "2035", "label": "<Endzustand>", "color": "#4b5563"}
  ],
  "recommendation": "<Konkrete altersgerechte Empfehlung>",
  "new_roles": ["<Jobtitel 1>", "<Jobtitel 2>", "<Jobtitel 3>"],
  "training": [
    {"term": "<konkreter Suchbegriff>", "platform": "<Udemy/LinkedIn/AMS/WKO/Google>", "why": "<1 Satz warum>"},
    {"term": "<Suchbegriff 2>", "platform": "<Plattform>", "why": "<warum>"},
    {"term": "<Suchbegriff 3>", "platform": "<Plattform>", "why": "<warum>"},
    {"term": "<Suchbegriff 4>", "platform": "<Plattform>", "why": "<warum>"},
    {"term": "<Suchbegriff 5>", "platform": "<Plattform>", "why": "<warum>"}
  ]
}`
    : `You are an expert in labor markets and AI automation. Analyze "${job}" for:
- Sector: ${sectorContext}
- Age: ${age}
- Experience: ${exp}

Rules:
- Public sector: risk_score 15-25 points LOWER
- Age 55+: focus on AI tool usage, NO complete retraining
- Age 18-35: boldly name new job profiles
- Age 36-54: targeted upskilling and hybrid roles

For training: CONCRETE search terms for Google, Udemy, LinkedIn Learning or Coursera.

Reply ONLY with JSON, no text before or after, no backticks:
{
  "job": "${job}",
  "risk_score": <number 0-100>,
  "critical_year": "<year>",
  "sector_note": "<1 sentence>",
  "verdict": "<2-3 sentences personalized>",
  "what_changes": ["<task 1>", "<task 2>", "<task 3>", "<task 4>", "<task 5>"],
  "what_stays": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "timeline": [
    {"year": "2025", "label": "AI assistance", "color": "#6366f1"},
    {"year": "2027", "label": "<what happens>", "color": "#f59e0b"},
    {"year": "2030", "label": "<what happens>", "color": "#ef4444"},
    {"year": "2035", "label": "<end state>", "color": "#4b5563"}
  ],
  "recommendation": "<Concrete age-appropriate recommendation>",
  "new_roles": ["<title 1>", "<title 2>", "<title 3>"],
  "training": [
    {"term": "<search term>", "platform": "<Udemy/LinkedIn/Coursera/Google>", "why": "<1 sentence>"},
    {"term": "<term 2>", "platform": "<platform>", "why": "<why>"},
    {"term": "<term 3>", "platform": "<platform>", "why": "<why>"},
    {"term": "<term 4>", "platform": "<platform>", "why": "<why>"},
    {"term": "<term 5>", "platform": "<platform>", "why": "<why>"}
  ]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Gesponserte Kurse mit Country-Filter
    const jobLower = job.toLowerCase();
    const { data: sponsoredData } = await supabase
      .from('sponsored_courses')
      .select('*')
      .eq('active', true)
      .eq('language', lang || 'de');

    let sponsoredCourse = null;
    if (sponsoredData && sponsoredData.length > 0) {
      for (const course of sponsoredData) {
        // Country check: ALL = immer, sonst nur wenn country im country_codes
        const countryCodes = (course.country_codes || 'ALL').toUpperCase();
        const countryMatch =
          countryCodes === 'ALL' ||
          country === 'unknown' ||
          countryCodes.split(',').map((c: string) => c.trim()).includes(country.toUpperCase());

        if (!countryMatch) continue;

        // Keyword check
        const keywords = course.job_keywords.toLowerCase().split(',').map((k: string) => k.trim());
        const keywordMatch = keywords.some((kw: string) =>
          jobLower.includes(kw) || kw.includes(jobLower.split(' ')[0])
        );

        if (keywordMatch) {
          sponsoredCourse = course;
          await supabase
            .from('sponsored_courses')
            .update({ display_count: (course.display_count || 0) + 1 })
            .eq('id', course.id);
          break;
        }
      }
    }

    // Statistik speichern
    const { error: dbError } = await supabase.from('job_analyses').insert({
      job_normalized: job.toLowerCase().trim(),
      job_original: job.trim(),
      sector: sector || null,
      age_group: age || null,
      experience: exp || null,
      risk_score: parsed.risk_score,
      risk_category: getRiskCategory(parsed.risk_score),
      language: lang || 'de',
      country,
      region,
      device_type,
      referrer: referrer.substring(0, 200),
      shared: false,
      session_id: session_id || null,
    });

    if (dbError) {
      console.error('SUPABASE ERROR:', JSON.stringify(dbError));
    } else {
      console.log(`SUPABASE OK: ${job} | Score: ${parsed.risk_score} | ${country} | ${device_type}`);
    }

    return NextResponse.json({ ...parsed, sponsoredCourse });
  } catch (e) {
    console.error('GENERAL ERROR:', e);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
