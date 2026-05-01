/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Mic, Volume2, Info, Thermometer, Droplets, Atom, List, Grid3X3, Zap, Layers, Activity, Tag, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ELEMENTS } from './constants';
import { ElementData } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(ELEMENTS[0]);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<ElementData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'isotopes' | 'physical' | 'chemical'>('overview');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#020617';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Suggestions logic
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = ELEMENTS.filter(e => 
        e.name.toLowerCase().startsWith(searchQuery.toLowerCase()) || 
        e.symbol.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        e.number.toString() === searchQuery
      ).slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const selectElement = (element: ElementData) => {
    setSelectedElement(element);
    setSearchQuery('');
    setSuggestions([]);
  };

  // Voice Input (Web Speech API)
  const toggleListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.replace(/[.?!,]+$/, '').toLowerCase().trim();
      setSearchQuery(transcript);
      
      const found = ELEMENTS.find(e => 
        e.name.toLowerCase() === transcript || 
        e.symbol.toLowerCase() === transcript ||
        e.number.toString() === transcript
      );
      if (found) {
        setSelectedElement(found);
      }
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [isListening]);

  // Text to Speech
  const speakDetails = useCallback(() => {
    if (!selectedElement) return;
    const msg = new SpeechSynthesisUtterance();
    let text = `${selectedElement.name}, symbol ${selectedElement.symbol.split('').join(' ')}, atomic number ${selectedElement.number}. It is a ${selectedElement.category} with atomic mass ${selectedElement.atomic_mass}. ${selectedElement.summary}`;
    
    if (activeTab === 'isotopes' && selectedElement.isotopes && selectedElement.isotopes.length > 0) {
      text += ` This element has ${selectedElement.isotopes.length} known isotopes, including ${selectedElement.isotopes.map(i => i.symbol).join(', ')}.`;
    }

    if (activeTab === 'physical') {
      text += ` Physical properties: The density is ${selectedElement.density} grams per cubic centimeter. `;
      if (selectedElement.melt) text += `Melting point is ${selectedElement.melt} Kelvin. `;
      if (selectedElement.boil) text += `Boiling point is ${selectedElement.boil} Kelvin. `;
      if (selectedElement.appearance) text += `It typically appears as ${selectedElement.appearance}. `;
    }

    if (activeTab === 'chemical') {
      if (selectedElement.electronegativity) text += `Electronegativity is ${selectedElement.electronegativity} on the Pauling scale. `;
      if (selectedElement.reactivity) text += `Chemical behavior: ${selectedElement.reactivity}. `;
      if (selectedElement.typical_compounds) text += `Common compounds include ${selectedElement.typical_compounds.join(', ')}. `;
    }
    
    msg.text = text;
    msg.pitch = 1;
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  }, [selectedElement, activeTab]);

  useEffect(() => {
    setActiveTab('overview');
  }, [selectedElement]);

  const getCategoryClass = (category: string) => {
    if (category.includes('alkali metal')) return 'cat-alkali';
    if (category.includes('alkaline earth')) return 'cat-alkaline';
    if (category.includes('transition metal')) return 'cat-transition';
    if (category.includes('post-transition')) return 'cat-reactive';
    if (category.includes('metalloid')) return 'cat-metalloid';
    if (category.includes('noble gas')) return 'cat-noble';
    if (category.includes('lanthanide')) return 'cat-lanthanide';
    if (category.includes('actinide')) return 'cat-actinide';
    return 'cat-reactive'; 
  };

  const PropItem = ({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) => (
    <div className={`border-l-2 pl-3 transition-colors ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
      <div className="text-[9px] uppercase text-slate-500 tracking-[0.1em] font-bold mb-1">
        {label}
      </div>
      <div className={`text-xs ${mono ? 'font-mono' : ''} truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col lg:flex-row h-screen w-full transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      {/* Sidebar: Element Analysis */}
      <aside className={`sidebar-panel w-full lg:w-[400px] flex flex-col p-6 overflow-y-auto shrink-0 z-20 transition-colors ${theme === 'dark' ? 'bg-slate-950 border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200 shadow-xl'}`}>
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-1 ${theme === 'dark' ? 'text-cyan-500' : 'text-cyan-600'}`}>
              Predictive Elemental
            </h1>
            <p className={`text-3xl font-extralight tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>System Analysis</p>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-900 text-yellow-500 hover:bg-slate-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {theme === 'dark' ? <Zap className="w-5 h-5 fill-current" /> : <Layers className="w-5 h-5" />}
          </button>
        </header>

        {/* Search */}
        <div className="relative mb-6">
          <input
            id="element-search"
            type="text"
            placeholder="Search Name, Symbol, No..."
            className={`w-full border rounded-xl py-4 px-11 text-sm focus:outline-none focus:border-cyan-500 transition-all font-medium shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-4.5 text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <button
            id="voice-search-btn"
            onClick={toggleListening}
            className={`absolute right-4 top-4 transition-colors ${isListening ? 'text-red-500' : 'text-cyan-500 hover:text-cyan-400'}`}
            title={isListening ? "Listening..." : "Voice Search"}
          >
            <div className="relative">
              {isListening && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0.3 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 bg-red-400 rounded-full blur-sm"
                />
              )}
              <Mic className={`w-4 h-4 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
            </div>
          </button>
          
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-12 top-4.5 text-[8px] font-bold uppercase tracking-widest text-red-500 pointer-events-none"
            >
              Listening
            </motion.div>
          )}

          {/* Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`absolute top-full left-0 right-0 mt-2 border rounded-xl overflow-hidden z-50 shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                {suggestions.map((e) => (
                  <button
                    key={e.number}
                    onClick={() => selectElement(e)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors text-sm ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                  >
                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{e.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${theme === 'dark' ? 'text-slate-500 bg-slate-950' : 'text-slate-400 bg-slate-100'}`}>{e.symbol}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Analysis Card */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {selectedElement ? (
              <motion.div
                key={selectedElement.number}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`h-full border rounded-2xl p-6 relative overflow-y-auto no-scrollbar flex flex-col ${theme === 'dark' ? 'bg-slate-900/30 border-white/5' : 'bg-slate-100/50 border-slate-200'}`}
              >
                {/* Background Large Number */}
                <div className={`absolute top-0 right-0 p-4 text-9xl font-black opacity-[0.03] select-none pointer-events-none italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {selectedElement.number}
                </div>

                <div className="relative flex flex-col h-full">
                  <header className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-500">
                        {selectedElement.category}
                      </div>
                      <div className={`text-[10px] font-mono font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Block {selectedElement.block.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <h2 className={`text-6xl font-extrabold tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {selectedElement.symbol}
                      </h2>
                      <span className={`text-xl font-light tracking-tight truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {selectedElement.name}
                      </span>
                    </div>
                  </header>

                  {/* Tabs */}
                  <div className={`flex p-1 rounded-xl mb-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200/50'}`}>
                    {[
                      { id: 'overview', label: 'Analysis' },
                      { id: 'isotopes', label: 'Isotopes' },
                      { id: 'physical', label: 'Physical' },
                      { id: 'chemical', label: 'Chemical' }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-2 text-[8px] sm:text-[9.5px] uppercase tracking-wider font-bold rounded-lg transition-all ${activeTab === tab.id ? (theme === 'dark' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'bg-white text-cyan-600 shadow-sm') : 'text-slate-500 hover:text-slate-400'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar pb-6 min-h-0">
                    <AnimatePresence mode="wait">
                      {activeTab === 'overview' && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <PropItem label="Atomic Mass" value={`${selectedElement.atomic_mass} u`} />
                            <PropItem label="Configuration" value={selectedElement.electron_configuration} mono />
                            <PropItem label="Standard State" value={selectedElement.phase} />
                            <PropItem label="Melt/Boil" value={`${selectedElement.melt || '-'}/${selectedElement.boil || '-'} K`} />
                            <PropItem label="Density" value={`${selectedElement.density || 'N/A'} g/cm³`} />
                            <PropItem label="Oxidation" value={selectedElement.oxidation_states || 'N/A'} />
                          </div>

                          <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[9px] uppercase tracking-widest mb-2">
                              <Info className="w-3.5 h-3.5" />
                              Technical Summary
                            </div>
                            <p className={`text-xs leading-relaxed font-light ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                              {selectedElement.summary}
                            </p>
                          </div>

                          <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[9px] uppercase tracking-widest mb-2">
                              <Zap className="w-3.5 h-3.5" />
                              Primary Applications
                            </div>
                            <p className={`text-xs leading-relaxed font-medium italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                              "{selectedElement.uses}"
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'isotopes' && (
                        <motion.div
                          key="isotopes"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-4"
                        >
                          {selectedElement.isotopes && selectedElement.isotopes.length > 0 ? (
                            selectedElement.isotopes.map((iso, i) => (
                              <div key={i} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-cyan-500 font-mono">{iso.symbol}</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${iso.half_life === 'Stable' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                      {iso.half_life === 'Stable' ? 'Stable' : 'Unstable'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-500">{iso.abundance}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[10px]">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-slate-500 uppercase font-bold tracking-tighter">Atomic Mass</span>
                                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{iso.mass.toFixed(4)} u</span>
                                  </div>
                                  {iso.half_life !== 'Stable' && (
                                    <>
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-slate-500 uppercase font-bold tracking-tighter">Half Life</span>
                                        <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{iso.half_life}</span>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-slate-500 uppercase font-bold tracking-tighter">Decay Mode</span>
                                        <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{iso.decay_mode}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {iso.uses && (
                                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-500 italic">
                                    <span className="font-bold not-italic uppercase text-[8px] mr-1">Uses:</span> {iso.uses}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="py-20 text-center space-y-4 opacity-30">
                              <Activity className="w-10 h-10 mx-auto" />
                              <p className="text-[10px] uppercase tracking-widest font-bold">Spectral analysis in progress...</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === 'physical' && (
                        <motion.div
                          key="physical"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <PropItem label="Thermal Cond." value={selectedElement.thermal_conductivity ? `${selectedElement.thermal_conductivity} W/mK` : 'N/A'} />
                            <PropItem label="Electrical Cond." value={selectedElement.electrical_conductivity ? `${selectedElement.electrical_conductivity} MS/m` : 'N/A'} />
                            <PropItem label="Crystal Structure" value={selectedElement.crystal_structure || 'N/A'} />
                            <PropItem label="Standard Phase" value={selectedElement.phase} />
                          </div>

                          <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[9px] uppercase tracking-widest mb-2">
                              <Droplets className="w-3.5 h-3.5" />
                              Appearance
                            </div>
                            <p className={`text-xs leading-relaxed font-medium italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                              {selectedElement.appearance || 'Typical for its category group.'}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'chemical' && (
                        <motion.div
                          key="chemical"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <PropItem label="Electronegativity" value={selectedElement.electronegativity || 'N/A'} />
                            <PropItem label="1st Ionization" value={selectedElement.ionization_energy ? `${selectedElement.ionization_energy} kJ/mol` : 'N/A'} />
                            <PropItem label="Oxidation States" value={selectedElement.oxidation_states} />
                            <PropItem label="Period/Group" value={`${selectedElement.period}/${selectedElement.group || 'f'}`} />
                          </div>

                          <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[9px] uppercase tracking-widest mb-3">
                              <Zap className="w-3.5 h-3.5" />
                              Reactivity & Compounds
                            </div>
                            <p className={`text-xs leading-relaxed font-light mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                              {selectedElement.reactivity || 'Exhibits standard periodic trends for its block.'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(selectedElement.typical_compounds || []).map(c => (
                                <span key={c} className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button 
                      onClick={speakDetails}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-lg uppercase tracking-widest ${theme === 'dark' ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20' : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-200/50'}`}
                    >
                      <Volume2 className="w-4 h-4" />
                      Narration
                    </button>
                    <button 
                      className={`px-4 rounded-xl transition-colors border shadow-sm ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-white/5' : 'bg-white hover:bg-slate-50 text-cyan-600 border-slate-200'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className={`h-full border border-dashed rounded-2xl flex flex-col items-center justify-center text-center px-8 text-xs italic ${theme === 'dark' ? 'border-slate-800 text-slate-600' : 'border-slate-300 text-slate-400'}`}>
                <Atom className="w-10 h-10 mb-3 opacity-20" />
                Select an entry for molecular analysis
              </div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Area: Interaction Grid */}
      <main className={`flex-1 flex flex-col p-8 overflow-hidden relative transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
        {/* Background Grid Pattern */}
        <div className={`absolute inset-0 opacity-[0.02] pointer-events-none ${theme === 'dark' ? 'opacity-5' : 'opacity-20'}`} style={{ backgroundImage: `radial-gradient(${theme === 'dark' ? '#22d3ee' : '#0284c7'} 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }}></div>
        
        <header className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex gap-8 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Alkali</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Transition</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Noble</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Reactive</span>
          </div>
          <div className={`text-[10px] font-mono uppercase tracking-widest bg-slate-900/5 px-4 py-1.5 rounded-full border ${theme === 'dark' ? 'text-slate-500 border-white/5 bg-slate-900/50' : 'text-slate-400 border-slate-200 bg-white'}`}>
             Interactive System <span className="text-cyan-500 font-bold ml-2">CORE_v2.0</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center overflow-auto min-h-0 relative z-10" ref={scrollRef}>
          <div className="periodic-grid w-full max-w-6xl min-w-[900px] p-4">
             {Array.from({ length: 10 }).map((_, r) => 
                Array.from({ length: 18 }).map((_, c) => {
                  const element = ELEMENTS.find(e => e.ypos === r + 1 && e.xpos === c + 1);
                  if (!element) return <div key={`empty-${r}-${c}`} className="aspect-square opacity-0"></div>;

                  return (
                    <motion.div
                      key={element.number}
                      layoutId={`element-${element.number}`}
                      onClick={() => selectElement(element)}
                      className={`
                        element-cell ${getCategoryClass(element.category)}
                        ${selectedElement?.number === element.number ? 'active' : ''}
                        ${theme === 'dark' ? 'border-white/5' : 'bg-white border-slate-200 shadow-sm'}
                      `}
                    >
                      <span className="text-[8px] opacity-40 font-mono absolute top-1 left-1.5">{element.number}</span>
                      <span className={`font-bold text-sm tracking-tighter ${selectedElement?.number === element.number ? 'text-cyan-400' : ''}`}>{element.symbol}</span>
                    </motion.div>
                  )
                })
             )}
          </div>
        </div>

        <footer className={`mt-auto pt-8 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.3em] relative z-10 border-t ${theme === 'dark' ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-200'}`}>
          <p className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-cyan-500" />
            AI ELEMENTAL SYSTEMS &copy; 2026
          </p>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-cyan-500'}`}></div> Active</div>
             <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div> Data: 118 Elements</div>
          </div>
        </footer>
      </main>


    </div>
  );
}
