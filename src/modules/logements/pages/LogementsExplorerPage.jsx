import React, { useState } from 'react';
import { FIANARANTSOA_QUARTIERS } from '../../../lib/constants';
import { Search, MapPin, Home } from 'lucide-react';

export const LogementsExplorerPage = () => {
  const [selectedQuartier, setSelectedQuartier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Hitady trano hofaina ao Fianarantsoa</h1>
        <p className="text-blue-100 mb-6">Mora, haingana, ary azo antoka ho an'ny mpanofa sy ny tompon-trano.</p>
        
        {/* Filter bar */}
        <div className="bg-white rounded-xl p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-800 shadow-md">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Karazana trano, fitaovana..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <select
              value={selectedQuartier}
              onChange={(e) => setSelectedQuartier(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            >
              <option value="">Fianarantsoa (Quartiers rehetra)</option>
              {FIANARANTSOA_QUARTIERS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Hikaroka Trano
          </button>
        </div>
      </div>

      {/* Grid of Listings Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl bg-white p-5 shadow-sm text-center py-12 col-span-full">
          <Home className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700">Lisitry ny trano hofaina</h3>
          <p className="text-sm text-slate-500 mt-1">Eto no hivoaka ireo trano rehetra misy sary, vidiny (Ariary), ary quartier.</p>
        </div>
      </div>
    </div>
  );
};
