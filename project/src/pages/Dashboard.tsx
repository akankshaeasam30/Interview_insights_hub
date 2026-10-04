import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, UserProgress } from '../lib/supabase';
import { CheckCircle, Circle, Lock, Award, Brain, Code, MessageCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadProgress();
  }, [profile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const rounds = [
    {
      id: 'aptitude',
      title: 'Aptitude Round',
      description: 'Test your logical reasoning and problem-solving skills',
      icon: Brain,
      completed: progress?.aptitude_completed || false,
      score: progress?.aptitude_score || 0,
      locked: false,
      path: '/rounds/aptitude',
    },
    {
      id: 'technical',
      title: 'Technical Round',
      description: 'OS, DBMS, Computer Networks, and Data Structures',
      icon: Code,
      completed: progress?.technical_completed || false,
      score: progress?.technical_score || 0,
      locked: !progress?.aptitude_completed,
      path: '/rounds/technical',
    },
    {
      id: 'coding',
      title: 'Coding Round',
      description: 'Solve coding problems in your preferred language',
      icon: TrendingUp,
      completed: progress?.coding_completed || false,
      score: progress?.coding_score || 0,
      locked: !progress?.technical_completed,
      path: '/rounds/coding',
    },
    {
      id: 'hr',
      title: 'HR Round',
      description: 'Personality, communication, and technical HR questions',
      icon: MessageCircle,
      completed: progress?.hr_completed || false,
      score: progress?.hr_score || 0,
      locked: !progress?.coding_completed,
      path: '/rounds/hr',
    },
  ];

  const totalScore = (progress?.aptitude_score || 0) + (progress?.technical_score || 0) +
                     (progress?.coding_score || 0) + (progress?.hr_score || 0);
  const completedRounds = rounds.filter(r => r.completed).length;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">Interview Insight Hub</span>
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
            <div 
  className="card border-0 shadow-lg rounded-4"
  style={{background: 'linear-gradient(135deg, #4c5bd4 0%, #5a2d82 100%)'}}
>
              <div className="card-body p-4 text-white">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="h4 fw-bold mb-2">Your Interview Journey</h2>
                    <p className="mb-0 opacity-75">
                      Complete all rounds to finish your interview preparation
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <div className="d-flex justify-content-md-end align-items-center gap-4">
                      <div>
                        <div className="h2 fw-bold mb-0">{completedRounds}/4</div>
                        <small className="opacity-75">Rounds</small>
                      </div>
                      <div>
                        <div className="h2 fw-bold mb-0">{totalScore}</div>
                        <small className="opacity-75">Total Score</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {rounds.map((round) => {
            const Icon = round.icon;
            return (
              <div key={round.id} className="col-md-6 col-lg-3">
                <div className={`card h-100 border-0 shadow-sm rounded-4 ${round.locked ? 'opacity-75' : ''}`}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`p-3 rounded-3 ${round.completed ? 'bg-success' : round.locked ? 'bg-secondary' : 'bg-primary'} bg-opacity-10`}>
                        <Icon className={`${round.completed ? 'text-success' : round.locked ? 'text-secondary' : 'text-primary'}`} size={28} />
                      </div>
                      <div>
                        {round.completed ? (
                          <CheckCircle className="text-success" size={24} />
                        ) : round.locked ? (
                          <Lock className="text-secondary" size={24} />
                        ) : (
                          <Circle className="text-muted" size={24} />
                        )}
                      </div>
                    </div>

                    <h3 className="h5 fw-bold mb-2">{round.title}</h3>
                    <p className="text-muted small mb-3">{round.description}</p>

                    {round.completed && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 text-success">
                          <Award size={18} />
                          <span className="fw-semibold">Score: {round.score}</span>
                        </div>
                      </div>
                    )}

                    <button
                      className={`btn w-100 ${round.locked ? 'btn-secondary' : round.completed ? 'btn-outline-success' : 'btn-primary'}`}
                      disabled={round.locked}
                      onClick={() => !round.locked && navigate(round.path)}
                    >
                      {round.locked ? 'Locked' : round.completed ? 'Review' : 'Start Round'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {progress?.overall_status === 'completed' && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 bg-success bg-opacity-10">
                <div className="card-body p-4 text-center">
                  <Award className="text-success mb-3" size={48} />
                  <h3 className="h4 fw-bold text-success mb-2">Congratulations!</h3>
                  <p className="text-muted mb-3">
                    You've completed all interview rounds. Check your detailed results.
                  </p>
                  <button
                    className="btn btn-success"
                    onClick={() => navigate('/results')}
                  >
                    View Detailed Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
