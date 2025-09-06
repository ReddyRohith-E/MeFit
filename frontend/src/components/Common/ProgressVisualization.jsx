import React from 'react';
import './ProgressVisualization.css';

const ProgressVisualization = ({ currentGoal, weekProgress, stats }) => {
  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3b82f6' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="circular-progress" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="circular-progress-svg">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="progress-background"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="progress-foreground"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="progress-text">
          <span className="progress-percentage">{percentage}%</span>
          <span className="progress-label">Complete</span>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ percentage, label, color = '#3b82f6' }) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label}</span>
          <span className="progress-bar-percentage">{percentage}%</span>
        </div>
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color,
              transition: 'width 0.5s ease-in-out'
            }}
          />
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, subtitle, icon, color = '#3b82f6' }) => {
    return (
      <div className="stat-card">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <div className="stat-content">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
      </div>
    );
  };

  if (!currentGoal) {
    return (
      <div className="progress-visualization">
        <div className="no-goal-message">
          <div className="no-goal-icon">🎯</div>
          <h3>No Active Goal</h3>
          <p>Set a new goal to start tracking your progress!</p>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(currentGoal.endDate);
  const goalProgress = currentGoal.progress?.completionPercentage || 0;
  const weekProgressPercentage = weekProgress?.percentage || 0;

  return (
    <div className="progress-visualization">
      <div className="progress-header">
        <h2>{currentGoal.title}</h2>
        <div className="progress-badges">
          <span className={`status-badge ${currentGoal.status}`}>
            {currentGoal.status}
          </span>
        </div>
      </div>

      <div className="progress-main">
        <div className="progress-circle-section">
          <CircularProgress 
            percentage={goalProgress} 
            size={140} 
            strokeWidth={10}
            color="#10b981"
          />
          <div className="goal-info">
            <div className="goal-stat">
              <span className="goal-stat-value">{daysRemaining}</span>
              <span className="goal-stat-label">Days Left</span>
            </div>
            <div className="goal-stat">
              <span className="goal-stat-value">
                {currentGoal.progress?.completedWorkouts || 0}/{currentGoal.workouts?.length || 0}
              </span>
              <span className="goal-stat-label">Workouts</span>
            </div>
          </div>
        </div>

        <div className="progress-details">
          <div className="progress-section">
            <h4>This Week Progress</h4>
            <ProgressBar 
              percentage={weekProgressPercentage}
              label={`${weekProgress?.completed || 0} of ${weekProgress?.total || 0} workouts`}
              color="#3b82f6"
            />
          </div>

          <div className="progress-section">
            <h4>Overall Progress</h4>
            <ProgressBar 
              percentage={goalProgress}
              label={`${currentGoal.progress?.completedWorkouts || 0} of ${currentGoal.workouts?.length || 0} workouts`}
              color="#10b981"
            />
          </div>

          {currentGoal.progress?.totalDuration > 0 && (
            <div className="progress-section">
              <h4>Time Invested</h4>
              <div className="time-stats">
                <span className="time-value">
                  {Math.round(currentGoal.progress.totalDuration / 60)} hours
                </span>
                <span className="time-label">Total workout time</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Goals"
          value={stats?.totalGoals || 0}
          icon="🎯"
          color="#3b82f6"
        />
        <StatCard
          title="Completed Goals"
          value={stats?.completedGoals || 0}
          icon="✅"
          color="#10b981"
        />
        <StatCard
          title="Total Workouts"
          value={stats?.totalWorkoutsCompleted || 0}
          icon="💪"
          color="#f59e0b"
        />
        <StatCard
          title="This Week"
          value={`${weekProgress?.completed || 0}/${weekProgress?.total || 0}`}
          subtitle="Workouts completed"
          icon="📅"
          color="#8b5cf6"
        />
      </div>

      {currentGoal.achievements && currentGoal.achievements.length > 0 && (
        <div className="achievements-section">
          <h4>Recent Achievements</h4>
          <div className="achievements-list">
            {currentGoal.achievements.slice(-3).map((achievement, index) => (
              <div key={index} className="achievement-item">
                <div className="achievement-icon">🏆</div>
                <div className="achievement-content">
                  <div className="achievement-title">{achievement.description}</div>
                  <div className="achievement-date">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressVisualization;
