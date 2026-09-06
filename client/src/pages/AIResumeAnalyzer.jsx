import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { FileSearch, CheckCircle2, XCircle, AlertCircle, Sparkles, History, ArrowRight, Lightbulb } from 'lucide-react';

export default function AIResumeAnalyzer() {
  const [jobTitle, setJobTitle] = useState('Full Stack Software Engineer');
  const [resumeText, setResumeText] = useState(
    `ALEX MORGAN\nComputer Science Student | alex@university.edu | github.com/alex-morgan\n\nTECHNICAL SKILLS:\n- Languages: JavaScript, Python, C++, HTML/CSS, SQL\n- Frontend: React, Redux, HTML5, CSS3, Tailwind\n- Backend: Node.js, Express, REST APIs, PostgreSQL, SQLite\n- Tools: Git, GitHub, VS Code, Postman\n\nPROJECTS:\nStudentOS — Student Productivity & Placement Platform\n- Built full-stack React + Node.js application with JWT authentication.\n- Integrated SQLite database for real-time task and attendance tracking.\n- Developed AI features for study plan generation and resume keyword analysis.`
  );
  const [jobDescription, setJobDescription] = useState(
    `We are looking for a Full Stack Software Engineer Intern / Junior Developer.\nRequirements:\n- Proficient in JavaScript, React, Node.js, Express, and REST APIs.\n- Experience with SQL databases (PostgreSQL or SQLite).\n- Knowledge of Git version control and GitHub workflow.\n- Familiarity with System Design, Unit Testing, and Docker is a strong plus.`
  );

  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSavedAnalyses = async () => {
    try {
      const res = await fetchApi('/ai/resume-analyses');
      setSavedAnalyses(res.analyses || []);
      if (res.analyses && res.analyses.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(res.analyses[0].result_json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchApi('/ai/resume-analyze', {
        method: 'POST',
        body: JSON.stringify({
          jobTitle,
          resumeText,
          jobDescription
        })
      });
      setCurrentAnalysis(res.analysis.result_json);
      loadSavedAnalyses();
    } catch (err) {
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 60) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">
          <FileSearch color="var(--accent-cyan)" /> AI Resume & JD Matcher
        </h1>
        <p className="page-subtitle">
          Extract skills, compute Job Description match percentage, and discover keyword optimization tips for tech interviews.
        </p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* Form Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card glass-card-glow">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Resume & Job Description</h3>

            {error && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAnalyze}>
              <div className="form-group">
                <label className="form-label">Target Position / Job Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Software Engineer, Frontend Intern"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Resume Text *</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste plain text of your resume..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description / Requirements *</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job posting text or key skills expected..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {loading ? 'Analyzing Skills...' : '🔍 Analyze Resume Match'}
              </button>
            </form>
          </div>

          {/* History */}
          {savedAnalyses.length > 0 && (
            <div className="glass-card">
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={16} /> Past Analyses
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {savedAnalyses.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentAnalysis(item.result_json)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{item.job_title}</span>
                    <span style={{ fontWeight: 700, color: getScoreColor(item.match_score) }}>{item.match_score}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Display */}
        <div>
          {loading ? (
            <div className="glass-card" style={{ textAlignment: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <Sparkles size={36} color="var(--accent-cyan)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <h3>AI HR Engine is extracting skills and comparing requirements...</h3>
            </div>
          ) : !currentAnalysis ? (
            <div className="glass-card" style={{ textAlignment: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <h3>No analysis selected</h3>
              <p style={{ marginTop: '0.5rem' }}>Paste your resume and target job description to get instant AI feedback.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Match Score Card */}
              <div className="glass-card glass-card-glow" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: `6px solid ${getScoreColor(currentAnalysis.matchScore)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${getScoreColor(currentAnalysis.matchScore)}40`
                }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
                    {currentAnalysis.matchScore}%
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Match Score</span>
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Target Role Analysis
                  </span>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.2rem' }}>{currentAnalysis.jobTitle}</h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    {currentAnalysis.matchScore >= 85
                      ? '🎯 High ATS Compatibility! Your resume contains most target tech keywords.'
                      : currentAnalysis.matchScore >= 65
                      ? '⚡ Moderate Match. Consider adding missing keywords highlighted below.'
                      : '⚠️ Low Compatibility. Incorporate required technical skills before submitting.'}
                  </p>
                </div>
              </div>

              {/* Skills Matching Grid */}
              <div className="grid-2">
                {/* Matching Skills */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} /> Matched Skills ({currentAnalysis.matchingSkills?.length || 0})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {currentAnalysis.matchingSkills?.map((skill, idx) => (
                      <span key={idx} className="badge badge-completed">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-rose)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={18} /> Missing Target Keywords ({currentAnalysis.missingSkills?.length || 0})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {currentAnalysis.missingSkills?.map((skill, idx) => (
                      <span key={idx} className="badge badge-high">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Improvement Suggestions */}
              {currentAnalysis.improvementSuggestions && (
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lightbulb color="var(--accent-amber)" size={20} /> Recommended Resume Enhancements
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentAnalysis.improvementSuggestions.map((tip, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.85rem 1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                          borderLeft: '3px solid var(--accent-amber)',
                          fontSize: '0.88rem',
                          color: '#e5e7eb'
                        }}
                      >
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
