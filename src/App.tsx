/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ClipboardList, 
  X,
  Search
} from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterStatus = 'all' | 'active' | 'completed';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zentodo-tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('zentodo-tasks', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos(prev => [newTodo, ...prev]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
        if (filter === 'active') return !todo.completed && matchesSearch;
        if (filter === 'completed') return todo.completed && matchesSearch;
        return matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [todos, filter, searchQuery]);

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center bg-neutral-50" id="app-container">
      <div className="w-full max-w-lg" id="todo-card">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between" id="header">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900" id="title">ZenTodo</h1>
            <p className="text-sm text-neutral-500 mt-1" id="subtitle">Stay focused, one task at a time.</p>
          </div>
          <div className="h-10 w-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white" id="logo">
            <CheckCircle2 size={24} />
          </div>
        </header>

        {/* Input area */}
        <form onSubmit={addTodo} className="relative group mb-8" id="add-todo-form">
          <input
            id="todo-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-16 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all placeholder:text-neutral-400"
          />
          <Plus 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" 
            size={20} 
          />
          <button
            id="add-button"
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-neutral-900/10"
          >
            Add
          </button>
        </form>

        {/* Filters & Actions */}
        <div className="flex flex-col gap-4 mb-6" id="controls">
          <div className="flex items-center justify-between" id="filter-stats">
            <div className="flex bg-neutral-100 p-1 rounded-xl" id="filter-tabs">
              {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  id={`filter-${status}`}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === status 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            {stats.completed > 0 && (
              <button 
                id="clear-completed"
                onClick={clearCompleted}
                className="text-xs font-medium text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="relative" id="search-container">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-neutral-100 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-neutral-300 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3" id="todo-list">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <motion.div
                  layout
                  key={todo.id}
                  id={`todo-item-${todo.id}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className={`group flex items-center justify-between p-4 bg-white border rounded-2xl transition-all hover:shadow-md ${
                    todo.completed ? 'border-neutral-100 opacity-60' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      id={`toggle-${todo.id}`}
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 transition-colors ${
                        todo.completed ? 'text-green-500' : 'text-neutral-300 hover:text-neutral-400'
                      }`}
                    >
                      {todo.completed ? <CheckCircle2 size={22} fill="currentColor" className="text-white" /> : <Circle size={22} />}
                      {todo.completed && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <CheckCircle2 size={22} className="text-green-500" />
                        </div>
                      )}
                    </button>
                    <span 
                      id={`text-${todo.id}`}
                      className={`text-sm transition-all ${
                        todo.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <button
                    id={`delete-${todo.id}`}
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center flex flex-col items-center justify-center text-neutral-400"
                id="empty-state"
              >
                <div className="bg-neutral-100 p-4 rounded-full mb-4">
                  <ClipboardList size={32} />
                </div>
                <p className="text-sm font-medium">No tasks found</p>
                <p className="text-xs mt-1">
                  {todos.length === 0 
                    ? "Your list is empty. Add something to get started!" 
                    : "Try broadening your search or filter."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        {stats.total > 0 && (
          <footer className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-neutral-400" id="footer">
            <div className="flex gap-4">
              <span>{stats.active} Active</span>
              <span>{stats.completed} Completed</span>
            </div>
            <span>{Math.round((stats.completed / (stats.total || 1)) * 100)}% Done</span>
          </footer>
        )}
      </div>
    </div>
  );
}

