
import React from 'react';
import { Scene, StoryLogEntry, HabitatPart } from '../types';
import ItemIcon from './icons/ItemIcon';
import LoadingSpinner from './LoadingSpinner';
import HabitatViewer from './HabitatViewer';

interface GameUIProps {
  scene: Scene | null;
  storyLog: StoryLogEntry[];
  inventory: string[];
  habitatParts: HabitatPart[];
  onChoice: (choice: string) => void;
  isLoading: boolean;
}

const GameUI: React.FC<GameUIProps> = ({ scene, storyLog, inventory, habitatParts, onChoice, isLoading }) => {
  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Left Panel: Habitat, Inventory & Story Log */}
      <aside className="lg:w-1/4 xl:w-1/5 flex flex-col gap-6">
        
        {/* Habitat Viewer */}
        <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm flex flex-col flex-grow min-h-[300px] lg:min-h-0">
          <h2 className="font-orbitron text-xl text-orange-400 mb-2 border-b border-orange-500/30 pb-2">HABITAT STATUS</h2>
          <HabitatViewer parts={habitatParts} />
        </div>

        {/* Inventory */}
        <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm">
          <h2 className="font-orbitron text-xl text-orange-400 mb-4 border-b border-orange-500/30 pb-2">INVENTORY</h2>
          {inventory.length > 0 ? (
            <ul className="space-y-2 max-h-24 overflow-y-auto pr-2">
              {inventory.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300">
                  <ItemIcon className="w-5 h-5 text-orange-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No items collected.</p>
          )}
        </div>

        {/* Story Log */}
        <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm">
          <h2 className="font-orbitron text-xl text-orange-400 mb-4 border-b border-orange-500/30 pb-2">MISSION LOG</h2>
          <div className="overflow-y-auto h-32 pr-2">
            {storyLog.length > 0 ? (
              <ul className="space-y-4">
                {[...storyLog].reverse().map(entry => (
                  <li key={entry.id} className="text-gray-400 text-sm border-l-2 border-orange-500/50 pl-3">
                    {entry.story.substring(0, 100)}...
                  </li>
                ))}
              </ul>
            ) : (
             <p className="text-gray-500 italic">Log is empty. The mission has just begun.</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Panel: Scene and Choices */}
      <main className="lg:w-3/4 xl:w-4/5 flex flex-col gap-6">
        <div className="relative w-full aspect-video bg-black/50 border border-orange-500/30 rounded-lg flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <LoadingSpinner />
          ) : scene ? (
            <img src={scene.imageUrl} alt={scene.imagePrompt} className="w-full h-full object-cover animate-fade-in" />
          ) : null}
        </div>
        
        <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-6 backdrop-blur-sm flex-grow flex flex-col">
           {isLoading ? (
              <p className="text-gray-400 italic animate-pulse">Awaiting transmission from Mars...</p>
           ) : scene && (
            <>
              <div className="prose prose-invert max-w-none text-gray-300 mb-6 flex-grow overflow-y-auto pr-2">
                <p>{scene.story}</p>
              </div>

              {scene.choices.length > 0 && !scene.gameOver && (
                <div>
                    <h3 className="font-orbitron text-lg text-orange-400 mb-4">WHAT DO YOU DO?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scene.choices.map((choice, index) => (
                        <button
                        key={index}
                        onClick={() => onChoice(choice)}
                        disabled={isLoading}
                        className="w-full text-left bg-orange-800/50 hover:bg-orange-700/70 border border-orange-500/50 text-orange-200 font-semibold p-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {`> ${choice}`}
                        </button>
                    ))}
                    </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
       <style>{`
          .animate-fade-in {
            animation: fadeIn 1s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          /* Custom scrollbar for webkit browsers */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #2d3748; /* gray-800 */
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #dd6b20; /* orange-600 */
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #c05621; /* orange-700 */
          }
        `}</style>
    </div>
  );
};

export default GameUI;