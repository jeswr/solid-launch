'use client';

import React, { useEffect, useState } from 'react';
import { Search, Loader2, Filter, Grid, List, ExternalLink, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SolidApp, loadAllApps } from '@/lib/rdfUtils';
import { getCategoryIcon } from '@/lib/imageUtils';
import { useTheme } from '@/lib/themeContext';
import AppCard from '@/components/AppCard';

export default function Home() {
  const [apps, setApps] = useState<SolidApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<SolidApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>(['All']);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    filterApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, apps]);

  const loadApps = async () => {
    setLoading(true);
    try {
      const loadedApps = await loadAllApps();
      setApps(loadedApps);
      
      // Extract unique categories
      const uniqueCategories = new Set<string>();
      loadedApps.forEach(app => uniqueCategories.add(app.category));
      setCategories(['All', ...Array.from(uniqueCategories).sort()]);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApps = () => {
    let filtered = apps;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(term) ||
        app.description.toLowerCase().includes(term) ||
        app.category.toLowerCase().includes(term)
      );
    }

    setFilteredApps(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <svg
                  className="h-10 w-10"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z"
                    fill="#7C4DFF"
                    stroke="#7C4DFF"
                    strokeWidth="2"
                  />
                  <path
                    d="M50 35L70 46.25V68.75L50 80L30 68.75V46.25L50 35Z"
                    fill="white"
                  />
                </svg>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Solid App Launcher</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Discover and launch Solid applications</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-[#7C4DFF] text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-[#7C4DFF] text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent appearance-none bg-white dark:bg-gray-800 cursor-pointer text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'All' ? 'All Categories' : `${getCategoryIcon(category)} ${category}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#7C4DFF] animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading Solid applications...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                Found <span className="font-semibold text-gray-900 dark:text-white">{filteredApps.length}</span> applications
              </p>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredApps.map((app, index) => (
                    <AppCard key={app.id} app={app} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredApps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">{app.description}</p>
                          <div className="flex items-center gap-4">
                            <a
                              href={app.homepage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6A3FE5] transition-colors duration-200 font-medium text-sm"
                            >
                              Open App
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {app.source && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Source: {app.source}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {filteredApps.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No applications found matching your criteria.</p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              Part of the{' '}
              <a
                href="https://solidproject.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7C4DFF] hover:text-[#6A3FE5] font-medium"
              >
                Solid Project
              </a>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Decentralizing the web, one app at a time
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
