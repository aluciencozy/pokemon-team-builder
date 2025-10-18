import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pokemonAPI, teamsAPI } from '../services/api';
import type { TeamCreate } from '../services/api';

interface PokemonData {
  id: number;
  name: string;
  image: string;
  types: string[];
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PokemonData[]>([]);
  const [teamSlots, setTeamSlots] = useState<(PokemonData | null)[]>(Array(6).fill(null));
  const [teamName, setTeamName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const searchPokemon = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const pokemon = await pokemonAPI.searchPokemon(searchTerm.trim());
      setSearchResults([pokemon]);
    } catch (error) {
      setSearchResults([]);
      setMessage('Pokemon not found. Please try a different name.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSearching(false);
    }
  };

  const addPokemonToTeam = (pokemon: PokemonData) => {
    const emptySlotIndex = teamSlots.findIndex((slot) => slot === null);
    if (emptySlotIndex !== -1) {
      const newTeamSlots = [...teamSlots];
      newTeamSlots[emptySlotIndex] = pokemon;
      setTeamSlots(newTeamSlots);
      setSearchResults([]);
      setSearchTerm('');
    } else {
      setMessage('Team is full! Remove a Pokemon to add another.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removePokemonFromTeam = (index: number) => {
    const newTeamSlots = [...teamSlots];
    newTeamSlots[index] = null;
    setTeamSlots(newTeamSlots);
  };

  const saveTeam = async () => {
    if (!user) {
      setMessage('Please log in to save teams.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!teamName.trim()) {
      setMessage('Please enter a team name.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const pokemonInTeam = teamSlots.filter((slot) => slot !== null);
    if (pokemonInTeam.length === 0) {
      setMessage('Please add at least one Pokemon to your team.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const teamData: TeamCreate = {
        name: teamName.trim(),
        pokemon: pokemonInTeam.map((pokemon) => ({ name: pokemon.name })),
      };

      await teamsAPI.createTeam(teamData);
      setMessage('Team saved successfully!');
      setTeamName('');
      setTeamSlots(Array(6).fill(null));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save team. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPokemon();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Build Your Team</h1>
          <p className="text-lg text-gray-600 mb-8">
            Please log in or create an account to start building your Pokémon team.
          </p>
          <div className="space-x-4">
            <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Login
            </a>
            <a
              href="/register"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Build Your Team</h1>
          <p className="text-lg text-gray-600">Create the ultimate Pokémon team</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md text-center">
            {message}
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Pokémon</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Pokémon name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={searchPokemon}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => addPokemonToTeam(pokemon)}
                  >
                    <div className="text-center">
                      <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-24 h-24 mx-auto mb-2"
                      />
                      <h4 className="font-medium text-gray-900 capitalize">{pokemon.name}</h4>
                      <div className="flex justify-center gap-1 mt-1">
                        {pokemon.types.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team Builder Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Team</h2>

          {/* Team Name Input */}
          <div className="mb-6">
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              placeholder="Enter team name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          {/* Team Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {teamSlots.map((pokemon, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 min-h-[120px] flex flex-col items-center justify-center"
              >
                {pokemon ? (
                  <div className="text-center">
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <p className="text-sm font-medium text-gray-900 capitalize">{pokemon.name}</p>
                    <button
                      onClick={() => removePokemonFromTeam(index)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">+</span>
                    </div>
                    <p className="text-sm">Empty Slot</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Team Button */}
          <div className="text-center">
            <button
              onClick={saveTeam}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Team'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
