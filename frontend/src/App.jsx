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

  const API_BASE = "[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)";

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
        <h1 className="text-xl font-bold text-blue-400">AI Technical Interview Prep & Code Reviewer</h1>
        
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
            <option value="SQL">SQL Queries</option>
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
          <div className="flex-1 border border-slate-700 rounded-md overflow-hidden relative">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-