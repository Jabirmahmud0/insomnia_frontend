import React, { useState } from 'react'
import './App.css'

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState(37);
  const [gender, setGender] = useState('Male');
  const [occupation, setOccupation] = useState('Teacher');
  const [bmiCategory, setBmiCategory] = useState('Overweight');
  
  // Sleep Details state
  const [sleepDuration, setSleepDuration] = useState(7);
  const [qualityOfSleep, setQualityOfSleep] = useState('Good');
  const [physicalActivity, setPhysicalActivity] = useState('Moderate');
  
  // Health Details state
  const [heartRate, setHeartRate] = useState(70);
  const [dailySteps, setDailySteps] = useState(5000);
  const [stressLevel, setStressLevel] = useState('Low');
  
  // Result state
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { id: 1, title: "Input Details" },
    { id: 2, title: "Sleep Details" },
    { id: 3, title: "Health Details" }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    const step = steps.find(s => s.id === currentStep);
    return step ? step.title : "Input Details";
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    // Use environment variable for API endpoint, with a default for development
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    
    // Prepare data for API submission
    const requestData = {
      Age: parseInt(age),
      Gender: gender,
      Occupation: occupation,
      "BMI Category": bmiCategory,
      "Sleep Duration": parseFloat(sleepDuration),
      "Quality of Sleep": qualityOfSleep === 'Poor' ? 1 : 
                     qualityOfSleep === 'Fair' ? 2 : 
                     qualityOfSleep === 'Good' ? 3 : 
                     qualityOfSleep === 'Very Good' ? 4 : 5,
      "Stress Level": stressLevel === 'Low' ? 1 : 
                  stressLevel === 'Minimal' ? 2 : 
                  stressLevel === 'Moderate' ? 3 : 
                  stressLevel === 'High' ? 4 : 5,
      "Physical Activity Level": physicalActivity === 'Sedentary' ? 1 : 
                            physicalActivity === 'Light' ? 2 : 
                            physicalActivity === 'Moderate' ? 3 : 
                            physicalActivity === 'Active' ? 4 : 5,
      "Heart Rate": parseInt(heartRate),
      "Daily Steps": parseInt(dailySteps),
      "Systolic BP": 120, // Default values for blood pressure
      "Diastolic BP": 80
    };

    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result);
      } else {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      // Check if it's a connection error
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        setError('Unable to connect to the prediction service. Please ensure the backend API is running.');
      } else {
        setError('Prediction failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    // Show result if we have it
    if (predictionResult) {
      // New two-tier result display logic
      const isLikelyHealthy = predictionResult.predicted_class === "Healthy";
      const primaryLabel = isLikelyHealthy 
        ? "Result: Likely Healthy" 
        : "Result: Likely Sleep Disorder";
      
      let secondaryInfo = null;
      if (!isLikelyHealthy) {
        // Determine subtype based on predicted class
        secondaryInfo = `Suggested subtype: ${predictionResult.predicted_class}`;
      }

      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Prediction Result</h2>
          
          {/* Result Card with enhanced UI approach */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start mb-3">
              <div className={`mr-3 mt-1 w-2 h-2 rounded-full ${isLikelyHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-base font-bold text-[#9CC6DB]">{primaryLabel}</p>
                {secondaryInfo && (
                  <p className="text-sm mt-1 text-gray-700">
                    {secondaryInfo}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-blue-50 p-2 rounded-md">
                <p className="text-xs text-gray-600">Ensemble Confidence</p>
                <p className="text-lg font-bold text-[#9CC6DB]">{predictionResult.ensemble_confidence}%</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-md">
                <p className="text-xs text-gray-600">RF Confidence</p>
                <p className="text-lg font-bold text-[#9CC6DB]">{predictionResult.rf_confidence}%</p>
              </div>
            </div>
            
            {/* Risk assessment */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-1">Risk Assessment:</p>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      !isLikelyHealthy && predictionResult.ensemble_confidence >= 70 ? 'bg-red-500' : 
                      !isLikelyHealthy && predictionResult.ensemble_confidence >= 50 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${!isLikelyHealthy ? predictionResult.ensemble_confidence : 100 - predictionResult.ensemble_confidence}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-xs font-medium text-gray-700">
                  {!isLikelyHealthy && predictionResult.ensemble_confidence >= 70 ? 'High Risk' : 
                   !isLikelyHealthy && predictionResult.ensemble_confidence >= 50 ? 'Moderate Risk' : 'Low Risk'}
                </span>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">
                Subtype suggestion is for screening only and requires clinical confirmation.
              </p>
            </div>
          </div>
          
          {/* Detailed info in collapsible section */}
          <details className="bg-gray-50 rounded-md p-3">
            <summary className="cursor-pointer text-xs font-medium text-gray-700">
              Detailed Results (for research purposes)
            </summary>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs mb-2">
                Predicted Class: <span className="font-semibold">{predictionResult.predicted_class}</span>
              </p>
              <p className="text-xs mb-2">
                Ensemble Confidence: <span className="font-semibold">{predictionResult.ensemble_confidence}%</span>
              </p>
              <p className="text-xs mb-2">
                Random Forest Confidence: <span className="font-semibold">{predictionResult.rf_confidence}%</span>
              </p>
              <p className="text-xs text-gray-500 italic">
                {predictionResult.confidence_note}
              </p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Model Information:</p>
                <p className="text-xs text-gray-600">Updated ensemble using Random Forest, XGBoost, Gradient Boosting, and Hybrid Stack models</p>
              </div>
            </div>
          </details>
          
          <button 
            onClick={() => {
              setPredictionResult(null);
              setCurrentStep(1);
            }}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-[#9CC6DB] to-[#74a5c2] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            Start New Prediction
          </button>
        </div>
      );
    }
    
    // Show loading state
    if (isLoading) {
      return (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9CC6DB] mb-3"></div>
          <p className="text-gray-700 text-sm mb-1">Analyzing your data with updated models...</p>
          <p className="text-xs text-gray-500">Using ensemble of Random Forest, XGBoost, Gradient Boosting, and Hybrid Stack models</p>
        </div>
      );
    }
    
    // Show error message
    if (error) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm text-center">{error}</p>
        </div>
      );
    }
    
    // Show form steps
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Age Slider */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Enter your Age: {age}</label>
              <input 
                type="range" 
                min="18" 
                max="100" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-2 bg-gradient-to-r from-[#c5ddf0] to-[#9CC6DB] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#74a5c2]"
              />
            </div>
            
            {/* Gender Dropdown */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Gender</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#c5ddf0] focus:border-transparent text-gray-800 text-sm"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            
            {/* Occupation Dropdown */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Occupation</label>
              <select 
                value={occupation} 
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#c5ddf0] focus:border-transparent text-gray-800 text-sm"
              >
                <option>Accountant</option>
                <option>Doctor</option>
                <option>Engineer</option>
                <option>Lawyer</option>
                <option>Manager</option>
                <option>Nurse</option>
                <option>Sales Representative</option>
                <option>Salesperson</option>
                <option>Scientist</option>
                <option>Software Engineer</option>
                <option>Teacher</option>
              </select>
            </div>
            
            {/* BMI Category Dropdown */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">BMI category</label>
              <select 
                value={bmiCategory} 
                onChange={(e) => setBmiCategory(e.target.value)}
                className="w-full p-2 border border-[#9CC6DB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#9CC6DB] focus:border-[#74a5c2] text-gray-800 text-sm"
              >
                <option>Normal</option>
                <option>Normal Weight</option>
                <option>Overweight</option>
                <option>Obese</option>
              </select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            {/* Sleep Duration Slider */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Sleep Duration (hours): {sleepDuration}</label>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={sleepDuration} 
                onChange={(e) => setSleepDuration(e.target.value)}
                className="w-full h-2 bg-gradient-to-r from-[#c5ddf0] to-[#9CC6DB] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#74a5c2]"
              />
            </div>
            
            {/* Quality of Sleep Dropdown */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Quality of Sleep</label>
              <select 
                value={qualityOfSleep} 
                onChange={(e) => setQualityOfSleep(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#c5ddf0] focus:border-transparent text-gray-800 text-sm"
              >
                <option>Poor</option>
                <option>Fair</option>
                <option>Good</option>
                <option>Very Good</option>
                <option>Excellent</option>
              </select>
            </div>
            
            {/* Physical Activity Dropdown */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Physical Activity Level</label>
              <select 
                value={physicalActivity} 
                onChange={(e) => setPhysicalActivity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#c5ddf0] focus:border-transparent text-gray-800 text-sm"
              >
                <option>Sedentary</option>
                <option>Light</option>
                <option>Moderate</option>
                <option>Active</option>
                <option>Very Active</option>
              </select>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            {/* Heart Rate Slider */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Resting Heart Rate: {heartRate} BPM</label>
              <input 
                type="range" 
                min="40" 
                max="120" 
                value={heartRate} 
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full h-2 bg-gradient-to-r from-[#c5ddf0] to-[#9CC6DB] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#74a5c2]"
              />
            </div>
            
            {/* Daily Steps Slider */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Daily Steps: {dailySteps}</label>
              <input 
                type="range" 
                min="0" 
                max="20000" 
                step="100"
                value={dailySteps} 
                onChange={(e) => setDailySteps(e.target.value)}
                className="w-full h-2 bg-gradient-to-r from-[#c5ddf0] to-[#9CC6DB] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#74a5c2]"
              />
            </div>
            
            {/* Stress Level Dropdown */}
            <div>
              <label className="block text-gray-800 mb-2 font-medium text-sm">Stress Level</label>
              <select 
                value={stressLevel} 
                onChange={(e) => setStressLevel(e.target.value)}
                className="w-full p-2 border border-[#9CC6DB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#9CC6DB] focus:border-[#74a5c2] text-gray-800 text-sm"
              >
                <option>Low</option>
                <option>Minimal</option>
                <option>Moderate</option>
                <option>High</option>
                <option>Very High</option>
              </select>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2">
      <div className="flex w-full max-w-4xl h-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Left Panel - Stepper Sidebar */}
        <div className="w-1/3 bg-[#c5ddf0] p-6 flex flex-col">
          <h1 className="text-xl font-bold text-[#2c4a5d] mb-8">Sleep Disorder Prediction</h1>
          
          <div className="space-y-4">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  currentStep === step.id 
                    ? 'bg-[#9CC6DB] text-[#1a2e3d] shadow-md' 
                    : 'bg-[#c5ddf0] text-[#2c4a5d] hover:bg-[#9CC6DB] hover:text-[#1a2e3d]'
                }`}
                onClick={() => !predictionResult && setCurrentStep(step.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  currentStep === step.id 
                    ? 'bg-[#74a5c2] text-white' 
                    : 'bg-[#9CC6DB] text-[#1a2e3d]'
                }`}>
                  {step.id}
                </div>
                <span className="font-medium text-sm">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Main Form Area */}
        <div className="w-2/3 bg-white p-8 rounded-r-3xl shadow-sm">
          {!predictionResult && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{getStepTitle()}</h2>
              <p className="text-sm text-gray-600 mb-6">Please provide the necessary and accurate information.</p>
            </>
          )}
          
          {renderStepContent()}
          
          {!predictionResult && !isLoading && currentStep < 3 && (
            <div className="mt-8 flex justify-between">
              <button 
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  currentStep === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-[#9CC6DB] to-[#74a5c2] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          )}
          
          {!predictionResult && !isLoading && currentStep === 3 && (
            <div className="mt-8 flex justify-between">
              <button 
                onClick={handleBack}
                className="px-5 py-2 rounded-full font-medium transition-all duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-[#9CC6DB] to-[#74a5c2] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? 'Predicting...' : 'Predict'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App