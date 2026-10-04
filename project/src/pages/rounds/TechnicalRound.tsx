import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle, ArrowLeft, Database, Cpu, Network, Binary } from 'lucide-react';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const technicalQuestions: Question[] = [
  {
    id: 1,
    category: 'OS',
    question: 'What is a deadlock in operating systems?',
    options: [
      'A situation where two or more processes are unable to proceed',
      'A memory allocation error',
      'A type of scheduling algorithm',
      'A file system error'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    category: 'OS',
    question: 'Which scheduling algorithm is used in Round Robin?',
    options: [
      'Priority-based',
      'Time quantum-based',
      'First-come first-served',
      'Shortest job first'
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    category: 'DBMS',
    question: 'What does ACID stand for in database transactions?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Accuracy, Correctness, Integration, Database',
      'Automated, Controlled, Isolated, Distributed',
      'Authentication, Control, Integrity, Data'
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    category: 'DBMS',
    question: 'Which of the following is NOT a type of database key?',
    options: [
      'Primary Key',
      'Foreign Key',
      'Composite Key',
      'Temporary Key'
    ],
    correctAnswer: 3
  },
  {
    id: 5,
    category: 'CN',
    question: 'Which layer of the OSI model is responsible for routing?',
    options: [
      'Data Link Layer',
      'Network Layer',
      'Transport Layer',
      'Session Layer'
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    category: 'CN',
    question: 'What is the purpose of DNS in computer networks?',
    options: [
      'To encrypt data',
      'To translate domain names to IP addresses',
      'To compress data packets',
      'To route packets'
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    category: 'DS',
    question: 'What is the time complexity of binary search?',
    options: [
      'O(n)',
      'O(n log n)',
      'O(log n)',
      'O(1)'
    ],
    correctAnswer: 2
  },
  {
    id: 8,
    category: 'DS',
    question: 'Which data structure uses LIFO principle?',
    options: [
      'Queue',
      'Stack',
      'Tree',
      'Graph'
    ],
    correctAnswer: 1
  }
];

export default function TechnicalRound() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(8).fill(null));
  const [timeLeft, setTimeLeft] = useState(900);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'OS', name: 'Operating Systems', icon: Cpu, color: 'primary' },
    { id: 'DBMS', name: 'Database Management', icon: Database, color: 'success' },
    { id: 'CN', name: 'Computer Networks', icon: Network, color: 'info' },
    { id: 'DS', name: 'Data Structures', icon: Binary, color: 'warning' }
  ];

  const categoryQuestions = selectedCategory
    ? technicalQuestions.filter(q => q.category === selectedCategory)
    : [];

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStarted(true);
    setCurrentQuestion(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const questionGlobalIndex = technicalQuestions.findIndex(
      q => q.id === categoryQuestions[currentQuestion].id
    );
    const newAnswers = [...answers];
    newAnswers[questionGlobalIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < categoryQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const currentCategoryIndex = categories.findIndex(c => c.id === selectedCategory);
      if (currentCategoryIndex < categories.length - 1) {
        setSelectedCategory(categories[currentCategoryIndex + 1].id);
        setCurrentQuestion(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      const currentCategoryIndex = categories.findIndex(c => c.id === selectedCategory);
      if (currentCategoryIndex > 0) {
        const prevCategory = categories[currentCategoryIndex - 1];
        setSelectedCategory(prevCategory.id);
        const prevCategoryQuestions = technicalQuestions.filter(q => q.category === prevCategory.id);
        setCurrentQuestion(prevCategoryQuestions.length - 1);
      }
    }
  };

  const calculateScore = () => {
    let correct = 0;
    technicalQuestions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / technicalQuestions.length) * 100);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    setLoading(true);

    const passed = finalScore >= 60;
    const timeTaken = 900 - timeLeft;

    try {
      const { error: attemptError } = await supabase
        .from('round_attempts')
        .insert({
          user_id: profile?.id,
          round_type: 'technical',
          score: finalScore,
          total_questions: technicalQuestions.length,
          time_taken: timeTaken,
          passed,
          answers: answers.map((ans, idx) => ({
            category: technicalQuestions[idx].category,
            question: technicalQuestions[idx].question,
            userAnswer: ans,
            correctAnswer: technicalQuestions[idx].correctAnswer,
            isCorrect: ans === technicalQuestions[idx].correctAnswer
          }))
        });

      if (attemptError) throw attemptError;

      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          technical_completed: passed,
          technical_score: finalScore,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile?.id);

      if (progressError) throw progressError;

      if (passed) {
        await supabase
          .from('user_profiles')
          .update({ current_round: 'coding' })
          .eq('id', profile?.id);
      }
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

  if (!started) {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-dark bg-primary">
          <div className="container">
            <button className="btn btn-outline-light" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} className="me-2" />
              Back to Dashboard
            </button>
            <span className="navbar-brand">Technical Round</span>
            <div style={{width: '120px'}}></div>
          </div>
        </nav>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h1 className="h2 fw-bold mb-3">Choose a Category to Begin</h1>
                <p className="text-muted">Complete all categories to finish the technical round</p>
              </div>

              <div className="row g-4 mb-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="col-md-6">
                      <div
                        className="card border-0 shadow-sm rounded-4 h-100 cursor-pointer"
                        style={{cursor: 'pointer'}}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <div className="card-body p-4">
                          <div className={`bg-${category.color} bg-opacity-10 rounded-3 p-3 d-inline-flex mb-3`}>
                            <Icon className={`text-${category.color}`} size={32} />
                          </div>
                          <h3 className="h5 fw-bold mb-2">{category.name}</h3>
                          <p className="text-muted mb-3">
                            {technicalQuestions.filter(q => q.category === category.id).length} Questions
                          </p>
                          <button className={`btn btn-${category.color}`}>
                            Start {category.id}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="h5 fw-bold text-primary mb-1">{technicalQuestions.length}</h4>
                        <p className="text-muted mb-0 small">Total Questions</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="h5 fw-bold text-primary mb-1">15</h4>
                        <p className="text-muted mb-0 small">Minutes</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="h5 fw-bold text-primary mb-1">60%</h4>
                        <p className="text-muted mb-0 small">Pass Mark</p>
                      </div>
                    </div>
                  </div>
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
                    {passed ? 'Well Done!' : 'Round Not Passed'}
                  </h2>
                  <p className="text-muted mb-4">
                    {passed
                      ? 'You have successfully passed the Technical Round!'
                      : 'You need at least 60% to pass. Keep learning!'}
                  </p>

                  <div className="bg-light rounded-3 p-4 mb-4">
                    <div className="h1 fw-bold mb-1">{score}%</div>
                    <p className="text-muted mb-0">Your Score</p>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate('/dashboard')}
                      disabled={loading}
                    >
                      {passed ? 'Continue to Coding Round' : 'Back to Dashboard'}
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

  const question = categoryQuestions[currentQuestion];
  const questionGlobalIndex = technicalQuestions.findIndex(q => q.id === question.id);
  const totalAnswered = answers.filter(a => a !== null).length;
  const progress = (totalAnswered / technicalQuestions.length) * 100;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">Technical Round - {selectedCategory}</span>
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
                <small className="text-muted">
                  Question {currentQuestion + 1} of {categoryQuestions.length} ({selectedCategory})
                </small>
                <small className="text-muted">{totalAnswered}/{technicalQuestions.length} Answered</small>
              </div>
              <div className="progress" style={{height: '8px'}}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{width: `${progress}%`}}
                />
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <div className="badge bg-primary mb-3">{question.category}</div>
                <h5 className="fw-bold mb-4">{question.question}</h5>

                <div className="d-grid gap-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      className={`btn btn-outline-primary text-start p-3 ${
                        answers[questionGlobalIndex] === index ? 'active' : ''
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="fw-semibold me-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between gap-3">
              <button
                className="btn btn-outline-secondary"
                onClick={handlePrevious}
                disabled={questionGlobalIndex === 0}
              >
                Previous
              </button>

              {questionGlobalIndex === technicalQuestions.length - 1 ? (
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={answers.some(a => a === null)}
                >
                  Submit Test
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
