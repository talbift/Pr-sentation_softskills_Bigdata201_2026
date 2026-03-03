import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const questions = [
  {
    id: 1,
    question: "Face à un changement soudain dans votre équipe, votre première réaction est de :",
    choices: [
      { label: "A", text: "Analyser rapidement la situation et proposer des solutions", score: 3 },
      { label: "B", text: "Attendre de voir comment les autres réagissent avant d'agir", score: 2 },
      { label: "C", text: "Exprimer votre désaccord et résister au changement", score: 1 },
      { label: "D", text: "Vous sentir dépassé(e) et avoir du mal à continuer", score: 0 },
    ],
  },
  {
    id: 2,
    question: "Lorsque votre responsable vous confie une tâche en dehors de vos habitudes :",
    choices: [
      { label: "A", text: "Vous l'acceptez avec enthousiasme comme une opportunité d'apprentissage", score: 3 },
      { label: "B", text: "Vous l'acceptez mais cherchez de l'aide auprès de collègues", score: 2 },
      { label: "C", text: "Vous la faites à contrecœur en restant dans votre zone de confort", score: 1 },
      { label: "D", text: "Vous doemandez à quelqu'un d'autre de la prendre en charge", score: 0 },
    ],
  },
  {
    id: 3,
    question: "En cas de conflit au sein de votre équipe, vous :",
    choices: [
      { label: "A", text: "Prenez l'initiative de réunir les parties pour trouver un compromis", score: 3 },
      { label: "B", text: "Écoutez les deux côtés et donnez votre avis si demandé", score: 2 },
      { label: "C", text: "Évitez le conflit et attendez qu'il se résolve seul", score: 1 },
      { label: "D", text: "Prenez parti sans chercher à comprendre l'autre perspective", score: 0 },
    ],
  },
  {
    id: 4,
    question: "Votre équipe adopte un nouvel outil de travail que vous ne connaissez pas. Vous :",
    choices: [
      { label: "A", text: "Explorez l'outil de façon autonome et partagez vos découvertes", score: 3 },
      { label: "B", text: "Suivez une formation et posez des questions si besoin", score: 2 },
      { label: "C", text: "Utilisez le minimum requis pour éviter les erreurs", score: 1 },
      { label: "D", text: "Continuez avec vos anciennes méthodes tant que possible", score: 0 },
    ],
  },
  {
    id: 5,
    question: "Quand un projet échoue malgré vos efforts, vous :",
    choices: [
      { label: "A", text: "Analysez les causes pour ne pas reproduire les mêmes erreurs", score: 3 },
      { label: "B", text: "Acceptez l'échec et passez rapidement à la suite", score: 2 },
      { label: "C", text: "Cherchez des responsables dans l'équipe", score: 1 },
      { label: "D", text: "Perdez confiance en vos capacités professionnelles", score: 0 },
    ],
  },
];

const PROFILE_RANGES = [
  { min: 12, max: 15, label: "Très Adaptable", color: "#22d3ee", emoji: "🚀", desc: "Leader naturel du changement, modèle pour l'équipe." },
  { min: 8, max: 11, label: "Adaptable", color: "#4ade80", emoji: "✅", desc: "Bonne flexibilité, quelques axes d'amélioration." },
  { min: 4, max: 7, label: "En Développement", color: "#facc15", emoji: "📈", desc: "Des efforts sont faits mais des blocages subsistent." },
  { min: 0, max: 3, label: "Peu Adaptable", color: "#f87171", emoji: "⚠️", desc: "Résistance au changement, nécessite un accompagnement." },
];

function getProfile(score) {
  return PROFILE_RANGES.find(p => score >= p.min && score <= p.max);
}

export default function App() {
  const [step, setStep] = useState("intro"); // intro | quiz | dashboard
  const [currentQ, setCurrentQ] = useState(0);
  const [votes, setVotes] = useState(
    questions.map(q => Object.fromEntries(q.choices.map(c => [c.label, ""])))
  );
  const [results, setResults] = useState(null);

  const handleVoteChange = (qIdx, choiceLabel, value) => {
    setVotes(prev => {
      const updated = [...prev];
      updated[qIdx] = { ...updated[qIdx], [choiceLabel]: value === "" ? "" : parseInt(value) || 0 };
      return updated;
    });
  };

  const isCurrentValid = () => {
    const q = votes[currentQ];
    return Object.values(q).every(v => v !== "");
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      computeResults();
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const computeResults = () => {
    let profileCounts = { "Très Adaptable": 0, "Adaptable": 0, "En Développement": 0, "Peu Adaptable": 0 };
    
    // For each "person", simulate their total score across questions
    // We'll distribute scores by weighting the votes
    // Strategy: for each question, we know how many chose A/B/C/D
    // We compute a "score distribution" across the class
    
    // Total number of people = sum of votes on Q1
    const totalPeople = Object.values(votes[0]).reduce((s, v) => s + (parseInt(v) || 0), 0);
    
    // Compute per-question score sums and choice distributions
    const questionStats = questions.map((q, qi) => {
      const choiceData = q.choices.map(c => ({
        label: c.label,
        text: c.text,
        count: parseInt(votes[qi][c.label]) || 0,
        score: c.score,
      }));
      const totalVotes = choiceData.reduce((s, c) => s + c.count, 0);
      const avgScore = totalVotes > 0 ? choiceData.reduce((s, c) => s + c.count * c.score, 0) / totalVotes : 0;
      return { question: q.question, choiceData, avgScore, totalVotes };
    });

    // Estimate class profile distribution using average scores per person
    // Simple model: assume scores are roughly additive across questions
    // We'll use the distribution of choices to simulate individual profiles
    // by assigning each "person slot" a score based on probability of each choice
    
    const totalScore = questionStats.reduce((s, q) => s + q.avgScore, 0);
    const maxScore = questions.length * 3;
    
    // For dashboard profiles, we simulate by distributing:
    const scoreDistrib = [0, 0, 0, 0]; // indexes for Très Adaptable, Adaptable, En Dev, Peu Adaptable
    
    // Run a simple simulation for each person
    for (let p = 0; p < totalPeople; p++) {
      let personScore = 0;
      questions.forEach((q, qi) => {
        const choices = q.choices;
        const counts = choices.map(c => parseInt(votes[qi][c.label]) || 0);
        const total = counts.reduce((s, v) => s + v, 0);
        if (total === 0) { personScore += 1; return; }
        // Pick a choice proportionally
        let rand = Math.random() * total;
        for (let i = 0; i < choices.length; i++) {
          rand -= counts[i];
          if (rand <= 0) { personScore += choices[i].score; break; }
        }
      });
      const profile = getProfile(personScore);
      if (profile) profileCounts[profile.label]++;
    }

    setResults({ profileCounts, questionStats, totalPeople, totalScore, maxScore });
    setStep("dashboard");
  };

  const radarData = results ? questions.map((q, i) => ({
    subject: `Q${i + 1}`,
    score: results.questionStats[i].avgScore,
    fullMark: 3,
  })) : [];

  const profileData = results ? PROFILE_RANGES.map(p => ({
    name: p.label,
    count: results.profileCounts[p.label],
    color: p.color,
    emoji: p.emoji,
  })) : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #0f0c29 100%)",
      fontFamily: "'Georgia', serif",
      color: "#e2e8f0",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(10px); }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 12px 32px; border-radius: 50px; font-size: 16px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s; letter-spacing: 0.5px; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-outline { background: transparent; color: #a5b4fc; border: 1px solid #a5b4fc; padding: 12px 24px; border-radius: 50px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .btn-outline:hover { background: rgba(165,180,252,0.1); }
        .vote-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: white; padding: 8px 14px; width: 80px; font-size: 18px; text-align: center; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s; }
        .vote-input:focus { border-color: #818cf8; background: rgba(129,140,248,0.15); }
        .vote-input::placeholder { color: rgba(255,255,255,0.3); }
        .choice-row { display: flex; align-items: center; gap: 16px; padding: 14px 18px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 10px; transition: all 0.2s; }
        .choice-row:hover { background: rgba(129,140,248,0.1); border-color: rgba(129,140,248,0.3); }
        .label-badge { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
        .progress-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); border-radius: 2px; transition: width 0.4s ease; }
        .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; text-align: center; }
        .tooltip-custom { background: #1e1b4b !important; border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 10px !important; color: white !important; font-family: 'DM Sans', sans-serif !important; }
      `}</style>

      {/* INTRO */}
      {step === "intro" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🧭</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,6vw,56px)", fontWeight: 900, background: "linear-gradient(135deg, #a5b4fc, #f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16, lineHeight: 1.1 }}>
            Êtes-vous adaptable<br/>en milieu professionnel ?
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "#94a3b8", lineHeight: 1.7, marginBottom: 48 }}>
            Un quiz interactif pour explorer les mécanismes et stratégies d'adaptabilité au sein de votre classe. Entrez les votes collectifs pour chaque réponse.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            {["5 questions", "Votes collectifs", "Tableau de bord"]. map(t => (
              <span key={t} style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 50, padding: "6px 18px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#a5b4fc" }}>{t}</span>
            ))}
          </div>
          <button className="btn-primary" style={{ fontSize: 18, padding: "16px 48px" }} onClick={() => setStep("quiz")}>
            Commencer le quiz →
          </button>
        </div>
      )}

      {/* QUIZ */}
      {step === "quiz" && (
        <div style={{ maxWidth: "100%", margin: "0 auto", padding: "48px 5%" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#a5b4fc", margin: 0 }}>
              Quiz d'Adaptabilité
            </h2>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#64748b" }}>
              {currentQ + 1} / {questions.length}
            </span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 40 }}>
            <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question card */}
          <div className="card" style={{ padding: "36px 32px", marginBottom: 32 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6366f1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
              Question {currentQ + 1}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, color: "#e2e8f0", marginBottom: 32, lineHeight: 1.4 }}>
              {questions[currentQ].question}
            </h3>

            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Entrez le nombre de personnes ayant choisi chaque réponse :
            </div>

            {questions[currentQ].choices.map((choice) => (
              <div key={choice.label} className="choice-row">
                <div className="label-badge">{choice.label}</div>
                <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#cbd5e1", lineHeight: 1.4 }}>
                  {choice.text}
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="vote-input"
                  value={votes[currentQ][choice.label]}
                  onChange={e => handleVoteChange(currentQ, choice.label, e.target.value)}
                />
              </div>
            ))}

            {/* Quick total */}
            {(() => {
              const total = Object.values(votes[currentQ]).reduce((s, v) => s + (parseInt(v) || 0), 0);
              return total > 0 ? (
                <div style={{ marginTop: 20, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6366f1", textAlign: "right" }}>
                  Total : <strong>{total} participant{total > 1 ? "s" : ""}</strong>
                </div>
              ) : null;
            })()}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn-outline" onClick={handlePrev} disabled={currentQ === 0}>
              ← Précédent
            </button>
            <button className="btn-primary" onClick={handleNext} disabled={!isCurrentValid()}>
              {currentQ === questions.length - 1 ? "Voir les résultats 🎯" : "Suivant →"}
            </button>
          </div>
          {!isCurrentValid() && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#f87171", textAlign: "center", marginTop: 12 }}>
              Veuillez remplir toutes les réponses avant de continuer.
            </p>
          )}
        </div>
      )}

      {/* DASHBOARD */}
      {step === "dashboard" && results && (
        <div style={{ maxWidth: "100%", margin: "0 auto", padding: "48px 5%" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, background: "linear-gradient(135deg, #a5b4fc, #f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>
              Résultats de la Classe
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#64748b", fontSize: 16 }}>
              {results.totalPeople} participant{results.totalPeople > 1 ? "s" : ""} · Analyse de l'adaptabilité professionnelle
            </p>
          </div>

          {/* Profile distribution */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 40 }}>
            {PROFILE_RANGES.map(p => {
              const count = results.profileCounts[p.label];
              const pct = results.totalPeople > 0 ? Math.round((count / results.totalPeople) * 100) : 0;
              return (
                <div key={p.label} className="stat-card" style={{ borderColor: `${p.color}33` }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{p.emoji}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: p.color, fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: p.color }}>{pct}%</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#64748b", marginTop: 4 }}>{count} personne{count > 1 ? "s" : ""}</div>
                  <div style={{ marginTop: 12, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: 2, transition: "width 1s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
            {/* Bar chart */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 24, color: "#e2e8f0" }}>Répartition des profils</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={profileData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "DM Sans" }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, fontFamily: "DM Sans" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {profileData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar chart */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 24, color: "#e2e8f0" }}>Score moyen par question</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "DM Sans" }} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="card" style={{ padding: "28px", marginBottom: 40 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 24, color: "#e2e8f0" }}>Détail par question</h3>
            {results.questionStats.map((qs, qi) => (
              <div key={qi} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: qi < results.questionStats.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#cbd5e1", lineHeight: 1.5, paddingRight: 16 }}>
                    <span style={{ color: "#6366f1", fontWeight: 700 }}>Q{qi + 1}. </span>{qs.question}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#a5b4fc" }}>{qs.avgScore.toFixed(1)}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#475569" }}>/ 3</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {qs.choiceData.map(c => {
                    const pct = qs.totalVotes > 0 ? Math.round((c.count / qs.totalVotes) * 100) : 0;
                    const scoreColors = ["#f87171", "#facc15", "#4ade80", "#22d3ee"];
                    return (
                      <div key={c.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", minWidth: 80, textAlign: "center" }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: scoreColors[c.score] }}>{c.label}</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#e2e8f0" }}>{pct}%</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#475569" }}>{c.count} vote{c.count > 1 ? "s" : ""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion insight */}
          {(() => {
            const topProfile = PROFILE_RANGES.reduce((best, p) => results.profileCounts[p.label] > results.profileCounts[best.label] ? p : best, PROFILE_RANGES[0]);
            const adaptPct = Math.round(((results.profileCounts["Très Adaptable"] + results.profileCounts["Adaptable"]) / results.totalPeople) * 100);
            return (
              <div className="card" style={{ padding: "28px", background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.3)", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#a5b4fc", marginBottom: 12 }}>Bilan de la classe</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#cbd5e1", lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
                  Le profil dominant de la classe est <strong style={{ color: topProfile.color }}>{topProfile.label} {topProfile.emoji}</strong> — {topProfile.desc}<br/><br/>
                  <strong style={{ color: "#4ade80" }}>{isNaN(adaptPct) ? 0 : adaptPct}%</strong> de la classe présente un bon niveau d'adaptabilité professionnelle.
                </p>
              </div>
            );
          })()}

          {/* Restart */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn-outline" onClick={() => { setStep("intro"); setCurrentQ(0); setVotes(questions.map(q => Object.fromEntries(q.choices.map(c => [c.label, ""])))); setResults(null); }}>
              🔄 Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}