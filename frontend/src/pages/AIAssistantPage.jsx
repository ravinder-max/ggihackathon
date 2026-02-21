import { useState, useRef, useEffect } from "react";
import { predictDiabetes, predictHeartDisease } from "../services/api";

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I'm your MedLedger AI Assistant. How can I help you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Health Prediction States
  const [diabetesForm, setDiabetesForm] = useState({
    glucose: "",
    bloodPressure: "",
    skinThickness: "",
    insulin: "",
    bmi: "",
    diabetesPedigree: "",
    age: ""
  });

  const [heartForm, setHeartForm] = useState({
    age: "",
    sex: "1",
    cp: "0",
    trestbps: "",
    chol: "",
    fbs: "0",
    restecg: "0",
    thalach: "",
    exang: "0",
    oldpeak: "",
    slope: "0",
    ca: "0",
    thal: "2"
  });

  const [predictionResult, setPredictionResult] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages(prev => [...prev, { type: "user", text: inputMessage }]);
    setInputMessage("");
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you analyze your health data. Try the prediction tools above!",
        "Based on your medical records, I recommend regular checkups.",
        "Would you like me to analyze your recent lab results?",
        "I can predict diabetes and heart disease risk. Select a tool from the tabs above."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { type: "bot", text: randomResponse }]);
      setLoading(false);
    }, 1000);
  };

  const handleDiabetesPredict = async () => {
    setLoading(true);
    try {
      const result = await predictDiabetes(diabetesForm);
      setPredictionResult({
        type: "diabetes",
        result: result.prediction,
        probability: result.probability
      });
    } catch (error) {
      console.error("Prediction error:", error);
    }
    setLoading(false);
  };

  const handleHeartPredict = async () => {
    setLoading(true);
    try {
      const result = await predictHeartDisease(heartForm);
      setPredictionResult({
        type: "heart",
        result: result.prediction,
        probability: result.probability
      });
    } catch (error) {
      console.error("Prediction error:", error);
    }
    setLoading(false);
  };

  // Note: Chatbot is now loaded globally in AppLayout and always visible

  const renderChatTab = () => (
    <div className="flex flex-col h-[600px] relative">
      {/* Chat Area */}
      <div className="flex-1 bg-gradient-to-b from-gray-50 to-white p-6 overflow-y-auto">
        {/* Welcome Message */}
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg">
            🤖
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Health Assistant</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Ask me anything about your health, medical records, or get insights from your data. 
            I am here to help 24/7.
          </p>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
            <button 
              onClick={() => { setSearchQuery("How do I view my medical records?"); setChatOpen(true); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              How do I view my records?
            </button>
            <button 
              onClick={() => { setSearchQuery("What does my lab result mean?"); setChatOpen(true); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              Explain my lab results
            </button>
            <button 
              onClick={() => { setSearchQuery("How do I share records with my doctor?"); setChatOpen(true); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              Share with doctor
            </button>
            <button 
              onClick={() => { setSearchQuery("What are my health risks?"); setChatOpen(true); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              Check health risks
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Bar at Bottom */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={handleSearchClick}
            placeholder="Ask me anything about your health..."
            className="w-full pl-12 pr-14 py-4 bg-gray-100 border-0 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 cursor-pointer"
            readOnly={chatOpen}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">
          Click the search bar to start chatting with your AI assistant
        </p>
      </div>

      {/* Close Chat Overlay */}
      {chatOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setChatOpen(false)}
        ></div>
      )}
    </div>
  );

  const renderDiabetesTab = () => (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Glucose Level</label>
          <input
            type="number"
            placeholder="mg/dL"
            className="input"
            value={diabetesForm.glucose}
            onChange={(e) => setDiabetesForm({...diabetesForm, glucose: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Blood Pressure</label>
          <input
            type="number"
            placeholder="mm Hg"
            className="input"
            value={diabetesForm.bloodPressure}
            onChange={(e) => setDiabetesForm({...diabetesForm, bloodPressure: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Skin Thickness</label>
          <input
            type="number"
            placeholder="mm"
            className="input"
            value={diabetesForm.skinThickness}
            onChange={(e) => setDiabetesForm({...diabetesForm, skinThickness: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Insulin</label>
          <input
            type="number"
            placeholder="mu U/ml"
            className="input"
            value={diabetesForm.insulin}
            onChange={(e) => setDiabetesForm({...diabetesForm, insulin: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">BMI</label>
          <input
            type="number"
            placeholder="kg/m²"
            className="input"
            value={diabetesForm.bmi}
            onChange={(e) => setDiabetesForm({...diabetesForm, bmi: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Age</label>
          <input
            type="number"
            placeholder="years"
            className="input"
            value={diabetesForm.age}
            onChange={(e) => setDiabetesForm({...diabetesForm, age: e.target.value})}
          />
        </div>
      </div>
      <button
        onClick={handleDiabetesPredict}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Analyzing..." : "Predict Diabetes Risk"}
      </button>
    </div>
  );

  const renderHeartTab = () => (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Age</label>
          <input
            type="number"
            className="input"
            value={heartForm.age}
            onChange={(e) => setHeartForm({...heartForm, age: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Sex</label>
          <select
            className="input"
            value={heartForm.sex}
            onChange={(e) => setHeartForm({...heartForm, sex: e.target.value})}
          >
            <option value="1">Male</option>
            <option value="0">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Chest Pain Type</label>
          <select
            className="input"
            value={heartForm.cp}
            onChange={(e) => setHeartForm({...heartForm, cp: e.target.value})}
          >
            <option value="0">Typical Angina</option>
            <option value="1">Atypical Angina</option>
            <option value="2">Non-anginal Pain</option>
            <option value="3">Asymptomatic</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Resting BP</label>
          <input
            type="number"
            placeholder="mm Hg"
            className="input"
            value={heartForm.trestbps}
            onChange={(e) => setHeartForm({...heartForm, trestbps: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Cholesterol</label>
          <input
            type="number"
            placeholder="mg/dl"
            className="input"
            value={heartForm.chol}
            onChange={(e) => setHeartForm({...heartForm, chol: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Max Heart Rate</label>
          <input
            type="number"
            className="input"
            value={heartForm.thalach}
            onChange={(e) => setHeartForm({...heartForm, thalach: e.target.value})}
          />
        </div>
      </div>
      <button
        onClick={handleHeartPredict}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Analyzing..." : "Predict Heart Disease Risk"}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-3xl shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="section-title">AI Health Assistant</h1>
            <p className="section-subtitle">Chat with AI or use prediction tools for health insights</p>
          </div>
        </div>
      </div>

      {/* Main AI Interface */}
      <div className="card-gradient p-0 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "chat" 
                ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>
          <button
            onClick={() => setActiveTab("diabetes")}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "diabetes" 
                ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Diabetes Predict
          </button>
          <button
            onClick={() => setActiveTab("heart")}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "heart" 
                ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Heart Predict
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "chat" && renderChatTab()}
        {activeTab === "diabetes" && renderDiabetesTab()}
        {activeTab === "heart" && renderHeartTab()}
      </div>

      {/* Prediction Result */}
      {predictionResult && (
        <div className={`card-gradient border-l-4 ${
          predictionResult.result === "Positive" 
            ? "border-l-red-500" 
            : "border-l-teal-500"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              predictionResult.result === "Positive" ? "bg-red-100" : "bg-teal-100"
            }`}>
              {predictionResult.result === "Positive" ? "⚠️" : "✅"}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {predictionResult.type === "diabetes" ? "Diabetes" : "Heart Disease"} Prediction Result
              </h3>
              <p className="text-sm text-gray-600">
                Risk Level: <span className={`font-bold ${
                  predictionResult.result === "Positive" ? "text-red-600" : "text-teal-600"
                }`}>
                  {predictionResult.result === "Positive" ? "High Risk" : "Low Risk"}
                </span>
                {predictionResult.probability && (
                  <span className="ml-2">
                    (Probability: {(predictionResult.probability * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
