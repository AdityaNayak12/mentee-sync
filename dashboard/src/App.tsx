import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Users,
  BookOpen,
  Filter,
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface Stat {
  program: string;
  subject: string;
  solved: number;
  total: number;
  percentage: number;
}

interface Mentee {
  _id?: string;
  name: string;
  email: string;
  lastSynced?: string;
  timestamp?: string; // from backend
  stats: Stat[];
}

const EXCLUDED_SUBJECTS = ['Academic Clubs', 'MISC Batch', 'Miscellaneous Batch -', 'MISC Batch -'];

export default function App() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const response = await fetch('/api/mentees');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data: Mentee[] = await response.json();
        
        const filteredData = data.map(mentee => {
          return {
            ...mentee,
            stats: (mentee.stats || []).filter(stat => 
              !EXCLUDED_SUBJECTS.some(excluded => 
                stat.subject.includes(excluded) || stat.program.includes(excluded)
              )
            )
          };
        });

        setMentees(filteredData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentees();
  }, []);

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    mentees.forEach(mentee => {
      if (mentee.stats) {
        mentee.stats.forEach(stat => subjects.add(stat.subject));
      }
    });
    return Array.from(subjects).sort();
  }, [mentees]);

  const filteredMentees = useMemo(() => {
    return mentees.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mentees, searchQuery]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getOverallPercentage = (stats: Stat[]) => {
    if (!stats || stats.length === 0) return null;
    const validStats = stats.filter(s => s.total > 0);
    if (validStats.length === 0) return 0;
    const totalPercentage = validStats.reduce((acc, curr) => acc + curr.percentage, 0);
    return totalPercentage / validStats.length;
  };

  const getDisplayStat = (stats: Stat[], subject: string) => {
    if (!stats) return null;
    
    if (subject === "") {
       const avg = getOverallPercentage(stats);
       if (avg === null) return null;
       
       const totalValidStats = stats.filter(s => s.total > 0).length;
       return {
         program: 'Overall',
         subject: 'Overall',
         solved: 1, 
         total: totalValidStats > 0 ? 1 : 0, 
         percentage: avg
       };
    }
    return stats.find(s => s.subject === subject) || null;
  };

  // --- KPI Calculations ---
  const kpiData = useMemo(() => {
    let validMentees = 0;
    let sumPSP = 0;
    let studentsBelow20 = 0;

    mentees.forEach(mentee => {
      const displayStat = getDisplayStat(mentee.stats, selectedSubject);
      if (displayStat && displayStat.total > 0) {
        validMentees++;
        sumPSP += displayStat.percentage;
        if (displayStat.percentage < 20) {
          studentsBelow20++;
        }
      }
    });

    const groupAvgPSP = validMentees > 0 ? sumPSP / validMentees : 0;
    const percentBelow20 = validMentees > 0 ? (studentsBelow20 / validMentees) * 100 : 0;

    const kpi1Passed = percentBelow20 < 35;
    const kpi2Passed = groupAvgPSP >= 40;

    return {
      groupAvgPSP,
      percentBelow20,
      kpi1Passed,
      kpi2Passed,
      validMentees
    };
  }, [mentees, selectedSubject]);

  const isSyncWarning = (syncTimeStr: string | undefined) => {
    if (!syncTimeStr) return false;
    const syncDate = new Date(syncTimeStr).getTime();
    if (isNaN(syncDate)) return false;
    const now = new Date().getTime();
    const diffHours = (now - syncDate) / (1000 * 60 * 60);
    return diffHours > 24;
  };

  const getProgressBarColor = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-200";
    if (percentage < 20) return "bg-red-600";
    if (percentage < 50) return "bg-orange-500";
    if (percentage <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const getProgressTextColor = (percentage: number | null) => {
    if (percentage === null) return "text-gray-400";
    if (percentage < 20) return "text-red-700 font-bold";
    if (percentage < 50) return "text-orange-700";
    if (percentage <= 75) return "text-yellow-700";
    return "text-green-700";
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage < 20) return "bg-red-100";
    if (percentage < 50) return "bg-orange-50";
    if (percentage <= 75) return "bg-yellow-50";
    return "bg-green-50";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading mentees data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center gap-3 border border-red-200 max-w-md w-full">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <p className="font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                <span className="text-xl font-semibold text-gray-800 tracking-tight">TA Progress Tracker</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium border border-indigo-200">
                 TA
               </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card: Total Mentees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Mentees</p>
                <h3 className="text-2xl font-bold text-gray-900">{mentees.length}</h3>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Currently being tracked</p>
          </div>

          {/* Card: KPI 1 (Below 20% limit) */}
          <div className={`rounded-xl shadow-sm border p-6 flex flex-col justify-center ${kpiData.kpi1Passed ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-4 mb-2">
              <div className={`p-3 rounded-xl ${kpiData.kpi1Passed ? 'bg-green-50 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Students &lt; 20% PSP</p>
                <div className="flex items-end gap-2">
                  <h3 className={`text-2xl font-bold ${kpiData.kpi1Passed ? 'text-gray-900' : 'text-red-700'}`}>
                    {kpiData.percentBelow20.toFixed(1)}%
                  </h3>
                  {kpiData.kpi1Passed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mb-1" />
                  )}
                </div>
              </div>
            </div>
            <p className={`text-xs mt-2 font-medium ${kpiData.kpi1Passed ? 'text-gray-400' : 'text-red-600'}`}>
              KPI 1 Target: &lt; 35%
            </p>
          </div>

          {/* Card: KPI 2 (Group Avg) */}
          <div className={`rounded-xl shadow-sm border p-6 flex flex-col justify-center ${kpiData.kpi2Passed ? 'bg-white border-gray-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center space-x-4 mb-2">
              <div className={`p-3 rounded-xl ${kpiData.kpi2Passed ? 'bg-green-50 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Group Average PSP</p>
                <div className="flex items-end gap-2">
                  <h3 className={`text-2xl font-bold ${kpiData.kpi2Passed ? 'text-gray-900' : 'text-orange-700'}`}>
                    {kpiData.groupAvgPSP.toFixed(1)}%
                  </h3>
                  {kpiData.kpi2Passed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500 mb-1" />
                  )}
                </div>
              </div>
            </div>
            <p className={`text-xs mt-2 font-medium ${kpiData.kpi2Passed ? 'text-gray-400' : 'text-orange-600'}`}>
              KPI 2 Target: &ge; 40%
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Mentee Overview</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Subject Selector Dropdown */}
            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg leading-5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                disabled={allSubjects.length === 0}
              >
                {allSubjects.length > 0 ? (
                  <>
                    <option value="">All Subjects (Overall Avg)</option>
                    {allSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </>
                ) : (
                  <option value="">No Subjects Found</option>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/75">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mentee
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {selectedSubject ? `${selectedSubject} Progress` : 'Overall Progress'}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Synced
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredMentees.length > 0 ? (
                  filteredMentees.map((mentee) => {
                    const uniqueId = mentee._id || mentee.email;
                    const isExpanded = expandedRow === uniqueId;
                    const displayStat = getDisplayStat(mentee.stats, selectedSubject);
                    
                    const syncTime = mentee.timestamp || mentee.lastSynced;
                    const showWarning = isSyncWarning(syncTime);

                    // Highlighting Logic for < 20% PSP
                    const isAtRisk = displayStat && displayStat.total > 0 && displayStat.percentage < 20;

                    let rowClass = "transition-colors cursor-pointer ";
                    if (isExpanded) {
                      rowClass += isAtRisk ? "bg-red-50/75 border-l-4 border-red-500" : "bg-indigo-50/40 border-l-4 border-transparent";
                    } else if (isAtRisk) {
                      rowClass += "bg-red-50/40 hover:bg-red-50 border-l-4 border-red-400";
                    } else {
                      rowClass += "hover:bg-gray-50 border-l-4 border-transparent";
                    }

                    return (
                      <React.Fragment key={uniqueId}>
                        <tr className={rowClass} onClick={() => toggleRow(uniqueId)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold uppercase border ${isAtRisk ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200'}`}>
                                {mentee.name ? mentee.name.charAt(0) : '?'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                  {mentee.name}
                                  {isAtRisk && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">At Risk</span>}
                                </div>
                                <div className="text-sm text-gray-500">{mentee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {displayStat !== null ? (
                              displayStat.total === 0 ? (
                                <span className="text-sm text-gray-400 italic">No questions given</span>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <div className="w-full max-w-[8rem] bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${getProgressBarColor(displayStat.percentage)}`} 
                                      style={{ width: `${Math.min(displayStat.percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-sm font-semibold ${getProgressTextColor(displayStat.percentage)}`}>
                                    {displayStat.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              )
                            ) : (
                              <span className="text-sm text-gray-400 italic">Not enrolled</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {formatDate(syncTime)}
                              </span>
                              {showWarning && (
                                <div className="group relative flex items-center" title="Last synced over 24h ago">
                                  <AlertCircle className="w-4 h-4 text-amber-500 cursor-help" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              className={`transition-colors p-2 rounded-full ${isAtRisk ? 'text-red-400 hover:text-red-700 hover:bg-red-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={4} className="px-0 py-0 border-b border-gray-200">
                              <div className={`p-6 shadow-inner border-y ${isAtRisk ? 'bg-red-50/30 border-red-100' : 'bg-gray-50/80 border-gray-200'}`}>
                                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-gray-400" /> 
                                  All Subjects for {mentee.name}
                                </h4>
                                
                                {mentee.stats && mentee.stats.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mentee.stats.map((stat, idx) => (
                                      <div key={idx} className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${stat.percentage < 20 ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                          <div className="pr-4">
                                            <h5 className="font-semibold text-gray-900 text-sm truncate" title={stat.subject}>
                                              {stat.subject}
                                            </h5>
                                            <p className="text-xs text-gray-500 truncate mt-0.5" title={stat.program}>
                                              {stat.program}
                                            </p>
                                          </div>
                                          {stat.total > 0 && (
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${getProgressBgColor(stat.percentage)} ${getProgressTextColor(stat.percentage)}`}>
                                              {stat.percentage.toFixed(1)}%
                                            </span>
                                          )}
                                        </div>
                                        
                                        <div className="mt-4">
                                          {stat.total === 0 ? (
                                            <div className="text-xs text-gray-400 italic">
                                              No questions given
                                            </div>
                                          ) : (
                                            <>
                                              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                                <span>Progress</span>
                                                <span className="font-medium text-gray-700">{stat.solved} / {stat.total} solved</span>
                                              </div>
                                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div 
                                                  className={`h-1.5 rounded-full ${getProgressBarColor(stat.percentage)}`} 
                                                  style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                                ></div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-gray-500 text-sm">
                                    No subject stats available for this mentee.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No mentees found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {searchQuery ? `We couldn't find anyone matching "${searchQuery}".` : "No mentees are currently being tracked."}
                        </p>
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery("")}
                            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
