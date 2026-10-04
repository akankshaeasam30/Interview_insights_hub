import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle, ArrowLeft, MessageCircle, User, Briefcase, Mic, MicOff } from 'lucide-react';

interface HRQuestion {
  id: number;
  category: 'personality' | 'communication' | 'technical_hr';
  question: string;
  type: 'text' | 'choice';
  options?: string[];
}

const hrQuestions: HRQuestion[] = [
  {
    id: 1,
    category: 'personality',
    question: 'Tell me about yourself and your background.',
    type: 'text'
  },
  {
    id: 2,
    category: 'personality',
    question: 'What are your greatest strengths?',
    type: 'choice',
    options: [
      'Problem-solving and analytical thinking',
      'Team collaboration and leadership',
      'Creativity and innovation',
      'Time management and organization'
    ]
  },
  {
    id: 3,
    category: 'personality',
    question: 'How do you handle stress and pressure?',
    type: 'text'
  },
  {
    id: 4,
    category: 'communication',
    question: 'Describe a time when you had to explain a complex technical concept to a non-technical person.',
    type: 'text'
  },
  {
    id: 5,
    category: 'communication',
    question: 'How do you prefer to communicate with team members?',
    type: 'choice',
    options: [
      'Face-to-face meetings',
      'Video calls',
      'Email and written communication',
      'Instant messaging and chat'
    ]
  },
  {
    id: 6,
    category: 'technical_hr',
    question: 'Why do you want to work in the technology industry?',
    type: 'text'
  },
  {
    id: 7,
    category: 'technical_hr',
    question: 'Where do you see yourself in 5 years?',
    type: 'text'
  },
  {
    id: 8,
    category: 'technical_hr',
    question: 'What interests you most about this position?',
    type: 'choice',
    options: [
      'Opportunity to learn and grow',
      'Working with cutting-edge technology',
      'Company culture and values',
      'Career advancement opportunities'
    ]
  }
];

export default function HRRound() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | number | null)[]>(new Array(hrQuestions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(1200);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    if (started && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [started, timeLeft, showResults]);

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setRecordingTime(0);
    }
  }, [isRecording]);

  const handleStart = () => {
    setStarted(true);
  };

  const handleTextAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleChoiceAnswer = (choiceIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = choiceIndex;
    setAnswers(newAnswers);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleNext = () => {
    if (currentQuestion < hrQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    const answered = answers.filter(a => a !== null && a !== '').length;
    const baseScore = Math.round((answered / hrQuestions.length) * 100);
    return Math.min(baseScore + Math.floor(Math.random() * 10), 100);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    setLoading(true);

    const passed = finalScore >= 60;
    const timeTaken = 1200 - timeLeft;

    try {
      const { error: attemptError } = await supabase
        .from('round_attempts')
        .insert({
          user_id: profile?.id,
          round_type: 'hr',
          score: finalScore,
          total_questions: hrQuestions.length,
          time_taken: timeTaken,
          passed,
          answers: answers.map((ans, idx) => ({
            category: hrQuestions[idx].category,
            question: hrQuestions[idx].question,
            answer: ans,
            type: hrQuestions[idx].type
          }))
        });

      if (attemptError) throw attemptError;

      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          hr_completed: passed,
          hr_score: finalScore,
          overall_status: passed ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile?.id);

      if (progressError) throw progressError;
    } catch (error) {
      console.error('Error saving results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'personality':
        return { icon: User, color: 'primary', label: 'Personality' };
      case 'communication':
        return { icon: MessageCircle, color: 'info', label: 'Communication' };
      case 'technical_hr':
        return { icon: Briefcase, color: 'success', label: 'Technical HR' };
      default:
        return { icon: MessageCircle, color: 'secondary', label: 'General' };
    }
  };

  if (!started) {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-dark bg-primary">
          <div className="container">
            <button className="btn btn-outline-light" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} className="me-2" />
              Back to Dashboard
            </button>
            <span className="navbar-brand">HR Round</span>
            <div style={{width: '120px'}}></div>
          </div>
        </nav>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                      <MessageCircle className="text-primary" size={48} />
                    </div>
                    <h1 className="h2 fw-bold mb-3">HR Interview Round</h1>
                    <p className="text-muted">Final round: Personality, Communication & Technical HR</p>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <div className="d-flex align-items-center gap-2">
                            <User className="text-primary" size={24} />
                            <div>
                              <h6 className="mb-0">Personality</h6>
                              <small className="text-muted">3 Questions</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <div className="d-flex align-items-center gap-2">
                            <MessageCircle className="text-info" size={24} />
                            <div>
                              <h6 className="mb-0">Communication</h6>
                              <small className="text-muted">2 Questions</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <div className="d-flex align-items-center gap-2">
                            <Briefcase className="text-success" size={24} />
                            <div>
                              <h6 className="mb-0">Technical HR</h6>
                              <small className="text-muted">3 Questions</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mb-4">
                    <h6 className="fw-bold mb-2">Instructions:</h6>
                    <ul className="mb-0 ps-3">
                      <li>You have 20 minutes to complete the interview</li>
                      <li>Answer questions using text or voice input</li>
                      <li>Be honest and professional in your responses</li>
                      <li>Each question evaluates different aspects</li>
                      <li>You need 60% to pass this final round</li>
                    </ul>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body text-center">
                          <h3 className="h4 fw-bold text-primary mb-1">{hrQuestions.length}</h3>
                          <p className="text-muted mb-0 small">Questions</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body text-center">
                          <h3 className="h4 fw-bold text-primary mb-1">20</h3>
                          <p className="text-muted mb-0 small">Minutes</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body text-center">
                          <h3 className="h4 fw-bold text-primary mb-1">60%</h3>
                          <p className="text-muted mb-0 small">Pass Mark</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-lg w-100" onClick={handleStart}>
                    Start HR Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const passed = score >= 60;

    return (
      <div className="min-vh-100 bg-light d-flex align-items-center">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-5 text-center">
                  {passed ? (
                    <div className="text-success mb-4">
                      <CheckCircle size={64} />
                    </div>
                  ) : (
                    <div className="text-danger mb-4">
                      <XCircle size={64} />
                    </div>
                  )}

                  <h2 className="h3 fw-bold mb-3">
                    {passed ? 'Interview Complete!' : 'Round Not Passed'}
                  </h2>
                  <p className="text-muted mb-4">
                    {passed
                      ? 'Congratulations! You have successfully completed all interview rounds!'
                      : 'You need at least 60% to pass. Practice your interview skills!'}
                  </p>

                  <div className="bg-light rounded-3 p-4 mb-4">
                    <div className="h1 fw-bold mb-1">{score}%</div>
                    <p className="text-muted mb-0">Overall Performance</p>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate(passed ? '/results' : '/dashboard')}
                      disabled={loading}
                    >
                      {passed ? 'View Final Results' : 'Back to Dashboard'}
                    </button>
                    {!passed && (
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = hrQuestions[currentQuestion];
  const categoryInfo = getCategoryInfo(question.category);
  const CategoryIcon = categoryInfo.icon;
  const progress = ((currentQuestion + 1) / hrQuestions.length) * 100;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">HR Interview Round</span>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white bg-opacity-25 rounded px-3 py-2">
              <Clock size={20} className="me-2" />
              <span className="fw-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">Question {currentQuestion + 1} of {hrQuestions.length}</small>
                <small className="text-muted">{Math.round(progress)}% Complete</small>
              </div>
              <div className="progress" style={{height: '8px'}}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{width: `${progress}%`}}
                />
              </div>
            </div>

            <div className="card border-0 shadow-lg rounded-4 mb-4">
              <div className="card-body p-5">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className={`bg-${categoryInfo.color} bg-opacity-10 rounded-circle p-3`}>
                    <CategoryIcon className={`text-${categoryInfo.color}`} size={32} />
                  </div>
                  <div>
                    <span className={`badge bg-${categoryInfo.color} mb-1`}>
                      {categoryInfo.label}
                    </span>
                    <h5 className="fw-bold mb-0">{question.question}</h5>
                  </div>
                </div>

                {question.type === 'text' ? (
                  <div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Your Answer</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        placeholder="Type your answer here..."
                        value={answers[currentQuestion] as string || ''}
                        onChange={(e) => handleTextAnswer(e.target.value)}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                      <div className="d-flex align-items-center gap-2">
                        {isRecording ? (
                          <>
                            <div className="spinner-grow spinner-grow-sm text-danger" />
                            <span className="text-danger fw-semibold">Recording: {formatTime(recordingTime)}</span>
                          </>
                        ) : (
                          <span className="text-muted">Use voice input</span>
                        )}
                      </div>
                      <button
                        className={`btn ${isRecording ? 'btn-danger' : 'btn-outline-primary'} btn-sm`}
                        onClick={toggleRecording}
                      >
                        {isRecording ? (
                          <>
                            <MicOff size={16} className="me-1" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic size={16} className="me-1" />
                            Start Recording
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {question.options?.map((option, index) => (
                      <button
                        key={index}
                        className={`btn btn-outline-primary text-start p-3 ${
                          answers[currentQuestion] === index ? 'active' : ''
                        }`}
                        onClick={() => handleChoiceAnswer(index)}
                      >
                        <span className="fw-semibold me-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between gap-3">
              <button
                className="btn btn-outline-secondary"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>

              <div className="d-flex gap-2">
                {hrQuestions.map((q, idx) => {
                  const cat = getCategoryInfo(q.category);
                  return (
                    <button
                      key={idx}
                      className={`btn btn-sm ${
                        answers[idx] !== null && answers[idx] !== ''
                          ? `btn-${cat.color}`
                          : idx === currentQuestion
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setCurrentQuestion(idx)}
                      style={{width: '36px', height: '36px'}}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {currentQuestion === hrQuestions.length - 1 ? (
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={answers.some(a => a === null || a === '')}
                >
                  Submit Interview
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
