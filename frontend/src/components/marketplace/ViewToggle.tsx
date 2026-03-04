// components/marketplace/ViewToggle.tsx
import { Grid, Map } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'map';
  setViewMode: (mode: 'grid' | 'map') => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-1 flex">
      <button
        onClick={() => setViewMode('grid')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
          viewMode === 'grid'
            ? 'bg-cyan-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Grid className="w-4 h-4" />
        <span>Grid</span>
      </button>
      <button
        onClick={() => setViewMode('map')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
          viewMode === 'map'
            ? 'bg-cyan-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Map className="w-4 h-4" />
        <span>Map</span>
      </button>
    </div>
  );
};

export default ViewToggle;