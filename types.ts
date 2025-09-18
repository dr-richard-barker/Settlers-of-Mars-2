
export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  ERROR = 'ERROR',
}

export interface HabitatPart {
  id: string;
  partType: 'CYLINDER' | 'DOME' | 'TUBE' | 'AIRLOCK';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface ScenePayload {
  story: string;
  imagePrompt: string;
  choices: string[];
  newItem: string | null;
  gameOver: boolean;
  habitatUpdate: Omit<HabitatPart, 'id'> | null;
}

export interface Scene extends ScenePayload {
  imageUrl: string;
}

export interface StoryLogEntry {
  id: number;
  story: string;
}