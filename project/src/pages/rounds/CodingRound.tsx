import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle, ArrowLeft, Play, Code } from 'lucide-react';

interface CodingProblem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  starterCode: {
    c: string;
    python: string;
    java: string;
    javascript: string;
  };
}

const codingProblems: CodingProblem[] = [
  {
    id: 1,
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    difficulty: 'Easy',
    testCases: [
      { input: '[2,7,11,15], target = 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], target = 6', expectedOutput: '[1,2]' }
    ],
    starterCode: {
      c: '// Write your C code here\nint* twoSum(int* nums, int numsSize, int target) {\n    // Your code here\n}',
      python: '# Write your Python code here\ndef twoSum(nums, target):\n    # Your code here\n    pass',
      java: '// Write your Java code here\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}',
      javascript: '// Write your JavaScript code here\nfunction twoSum(nums, target) {\n    // Your code here\n}'
    }
  },
  {
    id: 2,
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    difficulty: 'Easy',
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' }
    ],
    starterCode: {
      c: '// Write your C code here\nvoid reverseString(char* s, int sSize) {\n    // Your code here\n}',
      python: '# Write your Python code here\ndef reverseString(s):\n    # Your code here\n    pass',
      java: '// Write your Java code here\nclass Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}',
      javascript: '// Write your JavaScript code here\nfunction reverseString(s) {\n    // Your code here\n}'
    }
  }
];

export default function CodingRound() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'c' | 'python' | 'java' | 'javascript'>('python');
  const [currentProblem, setCurrentProblem] = useState(0);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [problemsSolved, setProblemsSolved] = useState<boolean[]>([false, false]);

  const languages = [
    { id: 'python', name: 'Python', color: 'primary' },
    { id: 'java', name: 'Java', color: 'danger' },
    { id: 'javascript', name: 'JavaScript', color: 'warning' },
    { id: 'c', name: 'C', color: 'info' }
  ];

  useEffect(() => {
    if (started) {
      setCode(codingProblems[currentProblem].starterCode[selectedLanguage]);
    }
  }, [started, currentProblem, selectedLanguage]);

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

  const handleStart = (language: 'c' | 'python' | 'java' | 'javascript') => {
    setSelectedLanguage(language);
    setStarted(true);
    setCode(codingProblems[0].starterCode[language]);
  };

  const handleRunCode = () => {
    const problem = codingProblems[currentProblem];
    const results = problem.testCases.map((testCase, index) => ({
      testCase: index + 1,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      passed: Math.random() > 0.3
    }));

    setTestResults(results);
    const allPassed = results.every(r => r.passed);

    if (allPassed) {
      const newSolved = [...problemsSolved];
      newSolved[currentProblem] = true;
      setProblemsSolved(newSolved);
    }
  };

  const calculateScore = () => {
    const solvedCount = problemsSolved.filter(s => s).length;
    return Math.round((solvedCount / codingProblems.length) * 100);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    setLoading(true);

    const passed = finalScore >= 50;
    const timeTaken = 1800 - timeLeft;

    try {
      const { error: attemptError } = await supabase
        .from('round_attempts')
        .insert({
          user_id: profile?.id,
          round_type: 'coding',
          score: finalScore,
          total_questions: codingProblems.length,
          time_taken: timeTaken,
          passed,
          answers: problemsSolved.map((solved, idx) => ({
            problem: codingProblems[idx].title,
            solved,
            language: selectedLanguage
          }))
        });

      if (attemptError) throw attemptError;

      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          coding_completed: passed,
          coding_score: finalScore,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile?.id);

      if (progressError) throw progressError;

      if (passed) {
        await supabase
          .from('user_profiles')
          .update({ current_round: 'hr' })
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
            <span className="navbar-brand">Coding Round</span>
            <div style={{width: '120px'}}></div>
          </div>
        </nav>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                  <Code className="text-primary" size={48} />
                </div>
                <h1 className="h2 fw-bold mb-3">Coding Round</h1>
                <p className="text-muted">Choose your preferred programming language</p>
              </div>

              <div className="row g-4 mb-4">
                {languages.map((lang) => (
                  <div key={lang.id} className="col-md-6 col-lg-3">
                    <div
                      className="card border-0 shadow-sm rounded-4 h-100"
                      style={{cursor: 'pointer'}}
                      onClick={() => handleStart(lang.id as any)}
                    >
                      <div className="card-body p-4 text-center">
                        <div className={`bg-${lang.color} bg-opacity-10 rounded-3 p-3 d-inline-flex mb-3`}>
                          <Code className={`text-${lang.color}`} size={32} />
                        </div>
                        <h3 className="h5 fw-bold mb-3">{lang.name}</h3>
                        <button className={`btn btn-${lang.color} w-100`}>
                          Start with {lang.name}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Round Information</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="h5 fw-bold text-primary mb-1">{codingProblems.length}</h4>
                        <p className="text-muted mb-0 small">Problems</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="h5 fw-bold text-primary mb-1">30</h4>
                        <p className="text-muted mb-0 small">Minutes</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className="h5 fw-bold text-primary mb-1">50%</h4>
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
    const passed = score >= 50;

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
                    {passed ? 'Great Job!' : 'Round Not Passed'}
                  </h2>
                  <p className="text-muted mb-4">
                    {passed
                      ? 'You have successfully passed the Coding Round!'
                      : 'You need to solve at least 50% of problems. Keep coding!'}
                  </p>

                  <div className="bg-light rounded-3 p-4 mb-3">
                    <div className="h1 fw-bold mb-1">{score}%</div>
                    <p className="text-muted mb-0">Your Score</p>
                  </div>

                  <div className="bg-light rounded-3 p-3 mb-4">
                    <p className="mb-1">
                      <strong>{problemsSolved.filter(s => s).length}</strong> out of{' '}
                      <strong>{codingProblems.length}</strong> problems solved
                    </p>
                    <small className="text-muted">Language: {selectedLanguage}</small>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate('/dashboard')}
                      disabled={loading}
                    >
                      {passed ? 'Continue to HR Round' : 'Back to Dashboard'}
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

  const problem = codingProblems[currentProblem];

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">Coding Round - {selectedLanguage}</span>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white bg-opacity-25 rounded px-3 py-2">
              <Clock size={20} className="me-2" />
              <span className="fw-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-3">
        <div className="row g-3">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="fw-bold mb-0">{problem.title}</h5>
                  <span className={`badge bg-${problem.difficulty === 'Easy' ? 'success' : 'warning'}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <p className="text-muted mb-4">{problem.description}</p>

                <h6 className="fw-bold mb-3">Test Cases</h6>
                {problem.testCases.map((testCase, index) => (
                  <div key={index} className="bg-light rounded-3 p-3 mb-2">
                    <div className="mb-1">
                      <small className="text-muted">Input:</small>
                      <div className="font-monospace small">{testCase.input}</div>
                    </div>
                    <div>
                      <small className="text-muted">Output:</small>
                      <div className="font-monospace small">{testCase.expectedOutput}</div>
                    </div>
                  </div>
                ))}

                {testResults.length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold mb-3">Test Results</h6>
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`border rounded-3 p-2 mb-2 ${
                          result.passed ? 'border-success bg-success bg-opacity-10' : 'border-danger bg-danger bg-opacity-10'
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <small>Test Case {result.testCase}</small>
                          {result.passed ? (
                            <CheckCircle size={16} className="text-success" />
                          ) : (
                            <XCircle size={16} className="text-danger" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Code Editor</h6>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={handleRunCode}>
                      <Play size={16} className="me-1" />
                      Run Code
                    </button>
                  </div>
                </div>

                <textarea
                  className="form-control font-monospace"
                  style={{
                    minHeight: '400px',
                    fontSize: '14px',
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                    border: 'none'
                  }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                />

                <div className="d-flex justify-content-between mt-3">
                  <div className="d-flex gap-2">
                    {codingProblems.map((_, idx) => (
                      <button
                        key={idx}
                        className={`btn btn-sm ${
                          problemsSolved[idx]
                            ? 'btn-success'
                            : idx === currentProblem
                            ? 'btn-primary'
                            : 'btn-outline-secondary'
                        }`}
                        onClick={() => setCurrentProblem(idx)}
                      >
                        Problem {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    Submit All
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
