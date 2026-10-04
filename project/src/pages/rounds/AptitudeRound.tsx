import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}


const allQuestions: Question[] = [
  {
    id: 1,
    question: "A train 240 meters long is running at a speed of 72 km/hr. It crosses a platform completely in 24 seconds. What is the length of the platform?",
    options: ["240 m", "300 m", "360 m", "480 m"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "A sum of money becomes ₹1331 in 3 years at compound interest. If the rate of interest is 10% per annum, what is the principal amount?",
    options: ["₹1000", "₹1100", "₹1200", "₹900"],
    correctAnswer: 0
  },
  {
    id: 3,
    question: "In a class of 100 students, 60 like Mathematics, 50 like Physics, and 30 like both. How many students like neither subject?",
    options: ["10", "20", "30", "40"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "A can complete a work in 15 days and B can complete the same work in 20 days. If both work together for 5 days, what fraction of the work remains?",
    options: ["1/3", "1/4", "1/2", "2/3"],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "The ratio of incomes of A and B is 4:5 and their expenditures are in the ratio 3:4. If each saves ₹1000, what is A’s income?",
    options: ["₹4000", "₹5000", "₹6000", "₹8000"],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "Find the missing number in the series: 3, 9, 27, 81, ?, 729",
    options: ["162", "243", "324", "216"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "A boat can travel 20 km upstream in 5 hours and 20 km downstream in 2 hours. What is the speed of the boat in still water?",
    options: ["5 km/hr", "6 km/hr", "7 km/hr", "8 km/hr"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "If A is 50% more efficient than B, and B alone can complete a work in 12 days, how many days will A and B together take to complete the work?",
    options: ["4.8", "5", "6", "7"],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "In a certain code language, COMPUTER is written as RFUVQNPC. How is PRINTER written in that code?",
    options: ["UQJOVFQ", "QSJOUFS", "SFUOJQS", "UOJQSFS"],
    correctAnswer: 0
  },
  {
    id: 10,
    question: "The average age of 6 persons is 25 years. After including one more person, the average becomes 27 years. What is the age of the new person?",
    options: ["35", "37", "39", "41"],
    correctAnswer: 2
  },

  {
    id: 11,
    question: "A shopkeeper marks his goods 25% above cost price and allows a discount of 10%. What is his profit percentage?",
    options: ["12.5%", "10%", "15%", "20%"],
    correctAnswer: 0
  },
  {
    id: 12,
    question: "Find the next number in the series: 2, 6, 7, 21, 22, 66, ?",
    options: ["67", "68", "70", "72"],
    correctAnswer: 0
  },
  {
    id: 13,
    question: "A man invests ₹5000 at 8% simple interest for 3 years. What will be the total amount received?",
    options: ["₹6200", "₹6400", "₹5800", "₹6000"],
    correctAnswer: 0
  },
  {
    id: 14,
    question: "The LCM of two numbers is 180 and their HCF is 6. If one number is 30, find the other number.",
    options: ["36", "48", "54", "60"],
    correctAnswer: 0
  },
  {
    id: 15,
    question: "A mixture contains milk and water in ratio 4:1. If 5 liters of water is added, ratio becomes 4:3. Find initial quantity of milk.",
    options: ["10", "20", "25", "30"],
    correctAnswer: 2
  },

  {
    id: 16,
    question: "Find the missing number: 1, 4, 10, 22, 46, ?",
    options: ["94", "96", "90", "92"],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "A train running at 90 km/hr crosses a pole in 12 seconds. What is its length?",
    options: ["200 m", "250 m", "300 m", "150 m"],
    correctAnswer: 2
  },
  {
    id: 18,
    question: "Probability of getting a number divisible by 3 when rolling a die?",
    options: ["1/3", "1/2", "1/6", "2/3"],
    correctAnswer: 0
  },
  {
    id: 19,
    question: "The difference between compound interest and simple interest for 2 years is ₹50 on principal ₹1000. Find rate.",
    options: ["5%", "10%", "8%", "6%"],
    correctAnswer: 1
  },
  {
    id: 20,
    question: "Average of first 20 natural numbers?",
    options: ["10.5", "11", "9.5", "10"],
    correctAnswer: 0
  },

  {
    id: 21,
    question: "A man covers half distance at 40 km/hr and remaining at 60 km/hr. Find average speed.",
    options: ["48", "50", "52", "45"],
    correctAnswer: 0
  },
  {
    id: 22,
    question: "Find next: 5, 10, 20, 40, 80, ?",
    options: ["120", "140", "160", "180"],
    correctAnswer: 2
  },
  {
    id: 23,
    question: "A can do work in 12 days, B in 15 days. Working together, how long?",
    options: ["6.67", "7", "8", "9"],
    correctAnswer: 0
  },
  {
    id: 24,
    question: "If 40% of a number is 200, what is 60%?",
    options: ["300", "250", "350", "400"],
    correctAnswer: 0
  },
  {
    id: 25,
    question: "Find next: 2, 5, 10, 17, 26, ?",
    options: ["35", "36", "37", "38"],
    correctAnswer: 2
  },

  {
    id: 26,
    question: "A shopkeeper sells an item at 20% loss. If he had sold it for ₹100 more, he would gain 10%. Find cost price.",
    options: ["250", "300", "200", "150"],
    correctAnswer: 0
  },
  {
    id: 27,
    question: "Time taken to travel 150 km at 50 km/hr?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 1
  },
  {
    id: 28,
    question: "Find next: 3, 6, 11, 18, 27, ?",
    options: ["38", "40", "36", "39"],
    correctAnswer: 0
  },
  {
    id: 29,
    question: "If 3x + 5 = 20, find x",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1
  },
  {
    id: 30,
    question: "Area of square with side 12 cm?",
    options: ["144", "124", "154", "164"],
    correctAnswer: 0
  },

  {
    id: 31,
    question: "Perimeter of rectangle length 10, breadth 5?",
    options: ["30", "40", "50", "60"],
    correctAnswer: 0
  },
  {
    id: 32,
    question: "Find next: 1, 3, 7, 15, 31, ?",
    options: ["63", "62", "64", "65"],
    correctAnswer: 0
  },
  {
    id: 33,
    question: "Simple interest on ₹2000 at 5% for 2 years?",
    options: ["200", "150", "250", "300"],
    correctAnswer: 0
  },
  {
    id: 34,
    question: "Find next: 4, 16, 36, 64, ?",
    options: ["81", "100", "121", "144"],
    correctAnswer: 1
  },
  {
    id: 35,
    question: "Probability of getting even number on dice?",
    options: ["1/2", "1/3", "2/3", "1/6"],
    correctAnswer: 0
  },

  {
    id: 36,
    question: "Find next: 2, 3, 5, 9, 17, ?",
    options: ["33", "34", "35", "36"],
    correctAnswer: 0
  },
  {
    id: 37,
    question: "Speed = 60 km/hr, time = 3 hrs, distance?",
    options: ["180", "200", "150", "210"],
    correctAnswer: 0
  },
  {
    id: 38,
    question: "Find next: 10, 20, 30, 40, ?",
    options: ["50", "60", "70", "80"],
    correctAnswer: 0
  },
  {
    id: 39,
    question: "If CP = ₹500, SP = ₹600, profit %?",
    options: ["20%", "15%", "25%", "30%"],
    correctAnswer: 0
  },
  {
    id: 40,
    question: "Find next: 6, 7, 9, 12, 16, ?",
    options: ["20", "21", "22", "23"],
    correctAnswer: 1
  }
];

// ✅ RANDOM 15
const getRandomQuestions = (q: Question[], count: number) =>
  [...q].sort(() => 0.5 - Math.random()).slice(0, count);

const sampleQuestions = getRandomQuestions(allQuestions, 15);

export default function AptitudeRound() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // ✅ 30 mins
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (started && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
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

  const handleStart = () => {
    setStarted(true);
    setAnswers(new Array(sampleQuestions.length).fill(null));
  };

  const handleAnswerSelect = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    sampleQuestions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    return Math.round((correct / sampleQuestions.length) * 100);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    setLoading(true);

    const passed = finalScore >= 60;
    const timeTaken = 1800 - timeLeft;

    try {
      await supabase.from('round_attempts').insert({
        user_id: profile?.id,
        round_type: 'aptitude',
        score: finalScore,
        total_questions: sampleQuestions.length,
        time_taken: timeTaken,
        passed
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ KEEP YOUR EXISTING JSX UI (NO CHANGE)
  // 👇 Your return part remains SAME


  if (!started) {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-dark bg-primary">
          <div className="container">
            <button className="btn btn-outline-light" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} className="me-2" />
              Back to Dashboard
            </button>
            <span className="navbar-brand">Aptitude Round</span>
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
                      <Clock className="text-primary" size={48} />
                    </div>
                    <h1 className="h2 fw-bold mb-3">Aptitude Round</h1>
                    <p className="text-muted">Test your logical reasoning and problem-solving skills</p>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body text-center">
                          <h3 className="h4 fw-bold text-primary mb-1">{sampleQuestions.length}</h3>
                          <p className="text-muted mb-0 small">Questions</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body text-center">
                          <h3 className="h4 fw-bold text-primary mb-1">30</h3>
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

                  <div className="alert alert-info mb-4">
                    <h6 className="fw-bold mb-2">Instructions:</h6>
                    <ul className="mb-0 ps-3">
                      <li>You have 30 minutes to complete all questions</li>
                      <li>Each question carries equal marks</li>
                      <li>You need 60% to pass this round</li>
                      <li>You can navigate between questions</li>
                      <li>The test will auto-submit when time runs out</li>
                    </ul>
                  </div>

                  <button className="btn btn-primary btn-lg w-100" onClick={handleStart}>
                    Start Aptitude Test
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
                    {passed ? 'Congratulations!' : 'Round Not Passed'}
                  </h2>
                  <p className="text-muted mb-4">
                    {passed
                      ? 'You have successfully passed the Aptitude Round!'
                      : 'You need at least 60% to pass. Keep practicing!'}
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
                      {passed ? 'Continue to Next Round' : 'Back to Dashboard'}
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

  const question = sampleQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">Aptitude Round</span>
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
                <small className="text-muted">Question {currentQuestion + 1} of {sampleQuestions.length}</small>
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

            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">{question.question}</h5>

                <div className="d-grid gap-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      className={`btn btn-outline-primary text-start p-3 ${
                        answers[currentQuestion] === index ? 'active' : ''
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
                disabled={currentQuestion === 0}
              >
                Previous
              </button>

              <div className="d-flex gap-2">
                {sampleQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    className={`btn btn-sm ${
                      answers[idx] !== null
                        ? 'btn-success'
                        : idx === currentQuestion
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => setCurrentQuestion(idx)}
                    style={{width: '36px', height: '36px'}}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentQuestion === sampleQuestions.length - 1 ? (
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
