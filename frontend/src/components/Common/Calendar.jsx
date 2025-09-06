import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ currentGoal, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getWorkoutForDate = (date) => {
    if (!currentGoal || !currentGoal.workouts) return null;
    
    const dateStr = date.toDateString();
    return currentGoal.workouts.find(workout => {
      const workoutDate = new Date(workout.scheduledDate);
      return workoutDate.toDateString() === dateStr;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
        >
          &#8249;
        </button>
        <h3 className="month-year">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          className="nav-button"
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
        >
          &#8250;
        </button>
      </div>

      <div className="calendar-weekdays">
        {weekdays.map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="calendar-day empty"></div>;
          }

          const workout = getWorkoutForDate(date);
          const dayClasses = [
            'calendar-day',
            isToday(date) && 'today',
            isSelected(date) && 'selected',
            workout && 'has-workout',
            workout && workout.completed && 'completed',
            workout && !workout.completed && 'scheduled'
          ].filter(Boolean).join(' ');

          return (
            <div
              key={index}
              className={dayClasses}
              onClick={() => handleDateClick(date)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDateClick(date);
                }
              }}
            >
              <span className="day-number">{date.getDate()}</span>
              {workout && (
                <div className="workout-indicator">
                  <span className={`workout-dot ${workout.completed ? 'completed' : 'pending'}`}>
                    {workout.completed ? '✓' : '○'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentGoal && (
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot today-dot"></span>
            <span>Today</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot completed-dot">✓</span>
            <span>Completed Workout</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot pending-dot">○</span>
            <span>Scheduled Workout</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
