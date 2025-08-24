'use client'

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../services/apiService';
import KPICard from '../ui/KPICard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TasksData {
  tasks: Array<{
    id: number;
    hotelId: number;
    title: string;
    description: string;
    assignedTo: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed';
    roomNumber?: string;
    dueDate: string;
    createdAt: string;
  }>;
  summary: {
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  todayTasks: Array<{
    id: number;
    title: string;
    priority: string;
    status: string;
    dueDate: string;
  }>;
}

const TasksDashboard: React.FC = () => {
  const [data, setData] = useState<TasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<number | null>(null);

  useEffect(() => {
    fetchTasksData();
  }, []);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardApi.getTasksOverview();
      
      if (response && (response as any).data) {
        setData((response as any).data);
      } else {
        throw new Error('Failed to fetch tasks data');
      }
    } catch (error: any) {
      console.error('Failed to fetch tasks data:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load tasks data');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string, notes?: string) => {
    try {
      setUpdatingTask(taskId);
      
      await dashboardApi.updateTaskStatus(taskId, { status: newStatus, notes });
      
      // Refresh data after successful update
      await fetchTasksData();
    } catch (error: any) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setUpdatingTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <ArrowPathIcon className="h-5 w-5 text-blue-600" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <KPICard
              key={i}
              title="Loading..."
              value=""
              icon={<ClockIcon className="h-8 w-8" />}
              loading={true}
            />
          ))}
        </div>
        <LoadingSpinner size="lg" text="Loading tasks data..." className="my-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Tasks Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchTasksData}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pending Tasks"
          value={data?.summary?.pending || 0}
          icon={<ClockIcon />}
          color="yellow"
          subtitle="Not yet started"
        />
        
        <KPICard
          title="In Progress"
          value={data?.summary?.inProgress || 0}
          icon={<ArrowPathIcon />}
          color="blue"
          subtitle="Currently working"
        />
        
        <KPICard
          title="Completed"
          value={data?.summary?.completed || 0}
          icon={<CheckCircleIcon />}
          color="green"
          subtitle="Finished tasks"
        />
        
        <KPICard
          title="Overdue"
          value={data?.summary?.overdue || 0}
          icon={<ExclamationTriangleIcon />}
          color="red"
          subtitle="Past due date"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Today's Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Tasks</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {data?.todayTasks && data.todayTasks.length > 0 ? (
              data.todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks scheduled for today</p>
            )}
          </div>
        </div>

        {/* Task Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors">
              <PlusIcon className="h-5 w-5" />
              <span>Create New Task</span>
            </button>
            
            <button className="w-full flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors">
              <WrenchScrewdriverIcon className="h-5 w-5" />
              <span>Report Maintenance Issue</span>
            </button>
            
            <button className="w-full flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors">
              <ArrowPathIcon className="h-5 w-5" />
              <span>Update Task Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* All Tasks List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">All Tasks</h2>
          <div className="flex space-x-2">
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {data?.tasks && data.tasks.length > 0 ? (
            data.tasks.map((task) => (
              <div key={task.id} className={`p-4 border rounded-lg ${
                task.priority === 'urgent' ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      {task.roomNumber && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          Room {task.roomNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          disabled={updatingTask === task.id}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updatingTask === task.id ? 'Updating...' : 'Start'}
                        </button>
                      )}
                      
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          disabled={updatingTask === task.id}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {updatingTask === task.id ? 'Updating...' : 'Complete'}
                        </button>
                      )}
                      
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks found</p>
          )}
        </div>
        
        {data?.tasks && data.tasks.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Load More Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksDashboard;