import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PokemonData[]>([]);
  const [teamSlots, setTeamSlots] = useState<(PokemonData | null)[]>(Array(6).fill(null));
  const [teamName, setTeamName] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const searchPokemon = async (): Promise<void> => {
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

  const addPokemonToTeam = (pokemon: PokemonData): void => {
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

  const removePokemonFromTeam = (index: number): void => {
    const newTeamSlots = [...teamSlots];
    newTeamSlots[index] = null;
    setTeamSlots(newTeamSlots);
  };

  const saveTeam = async (): Promise<void> => {
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

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      searchPokemon();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const slotVariants = {
    empty: { scale: 1 },
    hover: { scale: 1.05 },
    filled: { scale: 1 },
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-6"
          >
            Build Your Team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
          >
            Please log in or create an account to start building your Pokémon team.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-x-4"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/login"
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Login
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
              Build Your Team
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Create the ultimate Pokémon team
            </p>
          </motion.div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-primary-100 dark:bg-primary-900 border border-primary-400 dark:border-primary-600 text-primary-700 dark:text-primary-300 rounded-xl text-center shadow-lg"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-dark-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-dark-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Search Pokémon
            </h2>
            <div className="flex gap-4">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Enter Pokémon name..."
                className="flex-1 px-6 py-4 bg-white/80 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={searchPokemon}
                disabled={isSearching}
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </motion.button>
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Search Results
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((pokemon, index) => (
                      <motion.div
                        key={pokemon.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/80 dark:bg-dark-700/50 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-dark-600 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                        onClick={() => addPokemonToTeam(pokemon)}
                      >
                        <div className="text-center">
                          <motion.img
                            whileHover={{ rotate: 5 }}
                            src={pokemon.image}
                            alt={pokemon.name}
                            className="w-24 h-24 mx-auto mb-3"
                          />
                          <h4 className="font-medium text-gray-800 dark:text-white capitalize mb-2">
                            {pokemon.name}
                          </h4>
                          <div className="flex justify-center gap-2">
                            {pokemon.types.map((type) => (
                              <span
                                key={type}
                                className="px-3 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-full capitalize font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Team Builder Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-dark-800/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-dark-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Your Team</h2>

            {/* Team Name Input */}
            <div className="mb-8">
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3"
              >
                Team Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                id="teamName"
                type="text"
                placeholder="Enter team name..."
                className="w-full px-6 py-4 bg-white/80 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            {/* Team Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {teamSlots.map((pokemon, index) => (
                <motion.div
                  key={index}
                  variants={slotVariants}
                  initial="empty"
                  whileHover="hover"
                  animate="filled"
                  className="bg-white/60 dark:bg-dark-700/30 backdrop-blur-md rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-dark-600 min-h-[140px] flex flex-col items-center justify-center hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200"
                >
                  <AnimatePresence mode="wait">
                    {pokemon ? (
                      <motion.div
                        key="filled"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center"
                      >
                        <motion.img
                          whileHover={{ rotate: 5 }}
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-16 h-16 mx-auto mb-2"
                        />
                        <p className="text-sm font-medium text-gray-800 dark:text-white capitalize mb-2">
                          {pokemon.name}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removePokemonFromTeam(index)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="w-16 h-16 mx-auto mb-2 bg-white/10 dark:bg-dark-600/50 rounded-full flex items-center justify-center">
                          <span className="text-2xl">+</span>
                        </div>
                        <p className="text-sm">Empty Slot</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Save Team Button */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveTeam}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-12 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Team'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
