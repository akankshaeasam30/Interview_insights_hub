import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, UserProgress, RoundAttempt } from '../lib/supabase';
import { Trophy, Brain, Code, TrendingUp, MessageCircle, Award, Clock, Target, ArrowLeft } from 'lucide-react';

export default function Results() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [attempts, setAttempts] = useState<RoundAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    if (!profile) return;

    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (progressError) throw progressError;
      setProgress(progressData);

      const { data: attemptsData, error: attemptsError } = await supabase
        .from('round_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (attemptsError) throw attemptsError;
      setAttempts(attemptsData || []);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const totalScore = (progress?.aptitude_score || 0) + (progress?.technical_score || 0) +
                     (progress?.coding_score || 0) + (progress?.hr_score || 0);
  const averageScore = Math.round(totalScore / 4);

  const rounds = [
    {
      id: 'aptitude',
      title: 'Aptitude Round',
      icon: Brain,
      color: 'primary',
      score: progress?.aptitude_score || 0,
      completed: progress?.aptitude_completed || false,
    },
    {
      id: 'technical',
      title: 'Technical Round',
      icon: Code,
      color: 'success',
      score: progress?.technical_score || 0,
      completed: progress?.technical_completed || false,
    },
    {
      id: 'coding',
      title: 'Coding Round',
      icon: TrendingUp,
      color: 'warning',
      score: progress?.coding_score || 0,
      completed: progress?.coding_completed || false,
    },
    {
      id: 'hr',
      title: 'HR Round',
      icon: MessageCircle,
      color: 'info',
      score: progress?.hr_score || 0,
      completed: progress?.hr_completed || false,
    },
  ];

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Outstanding', color: 'success' };
    if (score >= 75) return { label: 'Excellent', color: 'primary' };
    if (score >= 60) return { label: 'Good', color: 'info' };
    if (score >= 40) return { label: 'Average', color: 'warning' };
    return { label: 'Needs Improvement', color: 'danger' };
  };

  const performance = getPerformanceLevel(averageScore);

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <button className="btn btn-outline-light me-3" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} className="me-2" />
            Dashboard
          </button>
          <span className="navbar-brand fw-bold">Interview Results</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Welcome, {profile?.full_name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg rounded-4"
                 style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div className="card-body p-5 text-white">
                <div className="text-center">
                  <div className="mb-4">
                    <Trophy size={64} className="mb-3" />
                  </div>
                  <h1 className="h2 fw-bold mb-2">Congratulations, {profile?.full_name}!</h1>
                  <p className="opacity-75 mb-4">
                    You have successfully completed all interview rounds
                  </p>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <div className="bg-white bg-opacity-20 rounded-3 p-3">
                        <div className="h2 fw-bold mb-1">{averageScore}%</div>
                        <small>Overall Score</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-white bg-opacity-20 rounded-3 p-3">
                        <div className="h2 fw-bold mb-1">4/4</div>
                        <small>Rounds Completed</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-white bg-opacity-20 rounded-3 p-3">
                        <div className="h2 fw-bold mb-1">{totalScore}</div>
                        <small>Total Points</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-white bg-opacity-20 rounded-3 p-3">
                        <div className="h5 fw-bold mb-1">{performance.label}</div>
                        <small>Performance</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <h3 className="h4 fw-bold mb-3">Round-wise Performance</h3>
          </div>
          {rounds.map((round) => {
            const Icon = round.icon;
            const roundAttempts = attempts.filter(a => a.round_type === round.id);
            const latestAttempt = roundAttempts[0];

            return (
              <div key={round.id} className="col-md-6 col-lg-3 mb-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className={`bg-${round.color} bg-opacity-10 rounded-3 p-3 d-inline-flex mb-3`}>
                      <Icon className={`text-${round.color}`} size={28} />
                    </div>
                    <h5 className="fw-bold mb-2">{round.title}</h5>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Score</small>
                        <small className="fw-bold">{round.score}%</small>
                      </div>
                      <div className="progress" style={{height: '8px'}}>
                        <div
                          className={`progress-bar bg-${round.color}`}
                          role="progressbar"
                          style={{width: `${round.score}%`}}
                        />
                      </div>
                    </div>

                    {latestAttempt && (
                      <div className="small">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">
                            <Target size={14} className="me-1" />
                            Accuracy
                          </span>
                          <span className="fw-semibold">
                            {latestAttempt.score}%
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">
                            <Clock size={14} className="me-1" />
                            Time
                          </span>
                          <span className="fw-semibold">
                            {Math.floor(latestAttempt.time_taken / 60)}m {latestAttempt.time_taken % 60}s
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`mt-3 badge bg-${round.completed ? 'success' : 'secondary'} w-100 py-2`}>
                      {round.completed ? 'Passed' : 'Not Completed'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="row mb-4">
          <div className="col-lg-6 mb-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Performance Analysis</h5>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">Overall Rating</span>
                    <span className={`badge bg-${performance.color}`}>{performance.label}</span>
                  </div>
                  <div className="progress" style={{height: '12px'}}>
                    <div
                      className={`progress-bar bg-${performance.color}`}
                      role="progressbar"
                      style={{width: `${averageScore}%`}}
                    />
                  </div>
                </div>

                <div className="bg-light rounded-3 p-3">
                  <h6 className="fw-bold mb-3">Strengths</h6>
                  <ul className="mb-0 ps-3">
                    {rounds
                      .filter(r => r.score >= 70)
                      .map(r => (
                        <li key={r.id} className="text-success mb-1">
                          Strong performance in {r.title} ({r.score}%)
                        </li>
                      ))}
                    {rounds.filter(r => r.score >= 70).length === 0 && (
                      <li className="text-muted">Keep practicing to identify your strengths</li>
                    )}
                  </ul>
                </div>

                <div className="bg-light rounded-3 p-3 mt-3">
                  <h6 className="fw-bold mb-3">Areas for Improvement</h6>
                  <ul className="mb-0 ps-3">
                    {rounds
                      .filter(r => r.score < 70)
                      .map(r => (
                        <li key={r.id} className="text-warning mb-1">
                          Focus more on {r.title} (Current: {r.score}%)
                        </li>
                      ))}
                    {rounds.filter(r => r.score < 70).length === 0 && (
                      <li className="text-success">Excellent! All areas show strong performance</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Attempt History</h5>

                <div className="overflow-auto" style={{maxHeight: '400px'}}>
                  {attempts.length === 0 ? (
                    <p className="text-muted text-center py-4">No attempts recorded yet</p>
                  ) : (
                    attempts.map((attempt) => {
                      const round = rounds.find(r => r.id === attempt.round_type);
                      if (!round) return null;
                      const Icon = round.icon;

                      return (
                        <div key={attempt.id} className="border-bottom pb-3 mb-3">
                          <div className="d-flex align-items-start gap-3">
                            <div className={`bg-${round.color} bg-opacity-10 rounded p-2`}>
                              <Icon className={`text-${round.color}`} size={20} />
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <h6 className="fw-bold mb-0">{round.title}</h6>
                                <span className={`badge bg-${attempt.passed ? 'success' : 'danger'}`}>
                                  {attempt.score}%
                                </span>
                              </div>
                              <small className="text-muted">
                                {new Date(attempt.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </small>
                              <div className="small mt-1">
                                <span className="text-muted">Time: {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 bg-success bg-opacity-10">
              <div className="card-body p-4 text-center">
                <Award className="text-success mb-3" size={48} />
                <h4 className="fw-bold mb-2">Well Done!</h4>
                <p className="text-muted mb-3">
                  You have completed the Interview Insight Hub successfully. Use these insights to improve further.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </button>
                  <button
                    className="btn btn-outline-success"
                    onClick={() => window.print()}
                  >
                    Print Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
