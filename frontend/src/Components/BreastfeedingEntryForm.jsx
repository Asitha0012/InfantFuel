import { useState, useEffect } from "react";
import { Baby, Clock, Edit, X, Play, Pause, Square } from "lucide-react";
import PropTypes from "prop-types";

const BreastfeedingEntryForm = ({ 
  onSubmit, 
  onCancel, 
  editEntry, 
  isSubmitting, 
  babyName = "Baby" 
}) => {
  const [formData, setFormData] = useState({
    duration: "",
    side: "left",
    dateRecorded: "",
    notes: ""
  });

  // Stopwatch state
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchInterval, setStopwatchInterval] = useState(null);

  useEffect(() => {
    if (editEntry) {
      setFormData({
        duration: editEntry.duration.toString(),
        side: editEntry.side,
        dateRecorded: new Date(editEntry.dateRecorded).toISOString().slice(0, 16),
        notes: editEntry.notes || ""
      });
    } else {
      setFormData({
        duration: "",
        side: "left",
        dateRecorded: new Date().toISOString().slice(0, 16),
        notes: ""
      });
    }
  }, [editEntry]);

  // Stopwatch functions
  const startStopwatch = () => {
    setIsStopwatchRunning(true);
    const interval = setInterval(() => {
      setStopwatchTime(prev => prev + 1);
    }, 1000);
    setStopwatchInterval(interval);
  };

  const pauseStopwatch = () => {
    setIsStopwatchRunning(false);
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      setStopwatchInterval(null);
    }
  };

  const stopStopwatch = () => {
    setIsStopwatchRunning(false);
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      setStopwatchInterval(null);
    }
    // Convert seconds to minutes and update form
    const minutes = Math.ceil(stopwatchTime / 60);
    setFormData(prev => ({ ...prev, duration: minutes.toString() }));
    setStopwatchTime(0);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      setStopwatchInterval(null);
    }
    setStopwatchTime(0);
    setFormData(prev => ({ ...prev, duration: "" }));
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.duration || !formData.side) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Baby className="w-5 h-5 text-blue-600" />
          {editEntry ? "Edit Breastfeeding Entry" : "Add Breastfeeding Entry"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <div className="relative">
              <input
                type="number"
                name="duration"
                value={isStopwatchRunning && stopwatchTime > 0 ? Math.ceil(stopwatchTime / 60) : formData.duration}
                onChange={handleChange}
                min="1"
                max="60"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isStopwatchRunning && stopwatchTime > 0 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter duration"
                required
                readOnly={isStopwatchRunning && stopwatchTime > 0}
              />
              <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Side */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Side *
            </label>
            <select
              name="side"
              value={formData.side}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Stopwatch Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Stopwatch Timer
            </h4>
            <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Alternative to manual entry
            </span>
          </div>
          
          {/* Stopwatch Display */}
          <div className="text-center mb-4">
            <div className={`text-4xl font-mono font-bold bg-white rounded-lg py-4 px-8 border-2 transition-all duration-300 ${
              isStopwatchRunning 
                ? 'text-green-600 border-green-400 shadow-lg animate-pulse' 
                : 'text-blue-600 border-blue-200'
            }`}>
              {formatTime(stopwatchTime)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {isStopwatchRunning ? 'Session in progress...' : 'Timer ready'}
            </div>
            {isStopwatchRunning && (
              <div className="mt-2 space-y-2">
                <div className="text-sm text-green-600 font-medium">
                  ⏱️ Timer Running...
                </div>
                {/* Progress bar for session tracking */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((stopwatchTime / 60) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  Session progress: {Math.min(Math.round((stopwatchTime / 60) * 100), 100)}%
                </div>
              </div>
            )}
            
            {/* Session Summary when stopped */}
            {!isStopwatchRunning && stopwatchTime > 0 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800 font-medium mb-1">
                  📊 Session Summary
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>Total time: {formatTime(stopwatchTime)}</div>
                  <div>Duration set: {Math.ceil(stopwatchTime / 60)} minutes</div>
                  <div className="text-blue-600 font-medium">
                    ✅ Ready to submit! Duration has been automatically set.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stopwatch Controls */}
          <div className="flex justify-center space-x-3">
            {!isStopwatchRunning ? (
              <button
                type="button"
                onClick={startStopwatch}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseStopwatch}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            
            <button
              type="button"
              onClick={stopStopwatch}
              disabled={stopwatchTime === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-4 h-4" />
              Stop & Set
            </button>
            
            <button
              type="button"
              onClick={resetStopwatch}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-3 text-xs text-gray-600 text-center">
            <p className="mb-1">💡 <strong>Quick Start:</strong> Click the Start button to begin timing!</p>
            <p className="mb-1">⏸️ <strong>Pause:</strong> Use if you need to stop temporarily</p>
            <p className="mb-1">⏹️ <strong>Stop & Set:</strong> Ends session and sets duration in form</p>
            <p className="mb-1">🔄 <strong>Reset:</strong> Clears timer and form duration</p>
            <p className="text-blue-600 font-medium">The duration field above updates in real-time while the timer runs!</p>
          </div>
        </div>

        {/* Date and Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date & Time *
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              name="dateRecorded"
              value={formData.dateRecorded}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, dateRecorded: new Date().toISOString().slice(0, 16) }))}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              title="Set to current time"
            >
              Now
            </button>
          </div>
          {isStopwatchRunning && (
            <p className="text-xs text-green-600 mt-1">
              ⏰ Session started at: {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional notes, feeding position, baby's behavior, etc..."
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {formData.notes.length}/500 characters
            </p>
            <div className="text-xs text-blue-600">
              💡 Tip: Note feeding position, baby's behavior, or any concerns
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {editEntry ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                {editEntry ? <Edit className="w-4 h-4" /> : <Baby className="w-4 h-4" />}
                {editEntry ? "Update Entry" : "Add Entry"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

BreastfeedingEntryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  editEntry: PropTypes.object,
  isSubmitting: PropTypes.bool.isRequired,
  babyName: PropTypes.string
};

export default BreastfeedingEntryForm;
