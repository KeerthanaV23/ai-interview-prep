import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

export default function App() {
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Easy');
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQ, setFetchingQ] = useState(false);
const [showOptimized, setShowOptimized] = useState(false);
  const API_BASE = "http://127.0.0.1:8000/api";
  

  const fetchQuestion = async (selectedTopic = topic, selectedDiff = difficulty) => {
    setFetchingQ(true);
    try {
      const res = await axios.get(`${API_BASE}/get-question?topic=${selectedTopic}&difficulty=${selectedDiff}`);
      setQuestion(res.data.data);
      setCode(res.data.data.starter_code || '# Write your solution here');
      setAnalysis(null);
      setShowOptimized(false);
    } catch (err) {
      alert("Failed to fetch question. Ensure FastAPI backend is running!");
    } finally {
      setFetchingQ(false);
    }
  };

  useEffect(() => {
    fetchQuestion(topic, difficulty);
  }, []);

  const handleTopicChange = (e) => {
    const newTopic = e.target.value;
    setTopic(newTopic);
    fetchQuestion(newTopic, difficulty);
  };

  const handleDifficultyChange = (e) => {
    const newDiff = e.target.value;
    setDifficulty(newDiff);
    fetchQuestion(topic, newDiff);
  };

  const handleReview = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/review-code`, {
        code: code,
        problem_statement: question.description,
        language: 'python'
      });
      setAnalysis(res.data.data);
    } catch (err) {
      alert("Error reviewing code with AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      {/* Header Controls */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-xl font-bold text-blue-400">AI Technical Interview Prep</h1>
        
        <div className="flex items-center gap-3">
          <select 
            value={topic} 
            onChange={handleTopicChange}
            className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="Arrays">Arrays & Hashing</option>
            <option value="Strings">Strings</option>
            <option value="LinkedList">Linked Lists</option>
            <option value="Trees">Binary Trees</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
          </select>

          <select 
            value={difficulty} 
            onChange={handleDifficultyChange}
            className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button 
            onClick={() => fetchQuestion(topic, difficulty)} 
            disabled={fetchingQ}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded text-sm font-semibold transition"
          >
            {fetchingQ ? "Loading..." : "Get New Problem"}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 flex-1 overflow-hidden">
        {/* Left: Problem Statement Panel */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-md overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-indigo-300">
                {fetchingQ ? "Fetching Problem..." : question ? question.title : "Select Topic"}
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
              }`}>
                {difficulty}
              </span>
            </div>
            
            {fetchingQ ? (
              <div className="text-xs text-indigo-400 font-semibold animate-pulse my-8 text-center">
                Fetching problem statement using fast AI model...
              </div>
            ) : (
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {question ? question.description : "Select a topic to start practicing."}
              </p>
            )}
          </div>
        </div>

        {/* Middle: Code Editor Panel */}
        <div className="flex flex-col gap-2">
          <div className="flex-1 border border-slate-700 rounded-md overflow-hidden relative min-h-[350px]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={showOptimized && analysis ? analysis.optimized_code : code}
              onChange={(val) => !showOptimized && setCode(val)}
              options={{ readOnly: showOptimized }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReview}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-semibold text-white transition text-sm"
            >
              {loading ? "Analyzing Code..." : "Submit & Review Code"}
            </button>

            {analysis?.optimized_code && (
              <button
                onClick={() => setShowOptimized(!showOptimized)}
                className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded font-semibold text-xs text-blue-300 transition"
              >
                {showOptimized ? "Edit My Code" : "View AI Solution"}
              </button>
            )}
          </div>
        </div>

        {/* Right: AI Evaluation Results Panel */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-md overflow-y-auto">
          <h2 className="text-lg font-bold mb-3 text-green-400">AI Performance Review</h2>
          {analysis ? (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-slate-700 p-3 rounded">
                <span className="font-medium">Overall Score:</span>
                <span className={`text-2xl font-bold ${analysis.score >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {analysis.score}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-700 p-2 rounded">
                  <p className="text-xs text-gray-400">Time Complexity</p>
                  <p className="font-semibold text-blue-300">{analysis.time_complexity}</p>
                </div>
                <div className="bg-slate-700 p-2 rounded">
                  <p className="text-xs text-gray-400">Space Complexity</p>
                  <p className="font-semibold text-blue-300">{analysis.space_complexity}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-indigo-300 mb-1">Summary:</p>
                <p className="text-gray-300 text-xs leading-relaxed">{analysis.summary}</p>
              </div>

              <div>
                <p className="font-semibold text-green-300 mb-1">Pros:</p>
                <ul className="list-disc pl-4 text-xs text-gray-300 space-y-1">
                  {analysis.pros?.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              {analysis.cons?.length > 0 && (
                <div>
                  <p className="font-semibold text-red-300 mb-1">Areas to Improve:</p>
                  <ul className="list-disc pl-4 text-xs text-gray-300 space-y-1">
                    {analysis.cons?.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-xs leading-relaxed">
              Write your solution in the Monaco editor and hit "Submit & Review Code" to get instant feedback and complexity analysis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}