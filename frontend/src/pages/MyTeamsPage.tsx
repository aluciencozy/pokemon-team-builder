import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { teamsAPI, pokemonAPI } from '../services/api';
import type { Team } from '../services/api';

interface PokemonWithImage {
  id: number;
  name: string;
  image: string;
}

interface TeamWithImages extends Team {
  pokemon: PokemonWithImage[];
}

const MyTeamsPage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const fetchedTeams = await teamsAPI.getTeams();

      // Fetch Pokemon images for each team
      const teamsWithImages = await Promise.all(
        fetchedTeams.map(async (team) => {
          const pokemonWithImages = await Promise.all(
            team.pokemon.map(async (pokemon) => {
              try {
                const pokemonData = await pokemonAPI.searchPokemon(pokemon.name);
                return {
                  ...pokemon,
                  image: pokemonData.image,
                };
              } catch (error) {
                return {
                  ...pokemon,
                  image: 'https://via.placeholder.com/96x96?text=?',
                };
              }
            })
          );

          return {
            ...team,
            pokemon: pokemonWithImages,
          };
        })
      );

      setTeams(teamsWithImages);
    } catch (error) {
      console.log(error);
      setError('Failed to load teams. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (teamId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      await teamsAPI.deleteTeam(teamId);
      setTeams(teams.filter((team) => team.id !== teamId));
    } catch (error) {
      setError('Failed to delete team. Please try again.');
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-6">
            My Teams
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Please log in to view your saved teams.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/login"
            className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Login
          </motion.a>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading your teams...</p>
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
              My Teams
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your saved Pokémon teams
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-center shadow-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Teams Grid */}
          <AnimatePresence>
            {teams.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-24 h-24 mx-auto mb-6 bg-white/10 dark:bg-dark-700/50 rounded-full flex items-center justify-center"
                >
                  <span className="text-4xl text-primary-400">🎮</span>
                </motion.div>
                <h3 className="text-2xl font-medium text-gray-800 dark:text-white mb-4">
                  No teams yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Start building your first Pokémon team!
                </p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Build Team
                </motion.a>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {teams.map((team) => (
                  <motion.div
                    key={team.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-white/80 dark:bg-dark-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <motion.h3
                          whileHover={{ scale: 1.05 }}
                          className="text-xl font-semibold text-gray-800 dark:text-white"
                        >
                          {team.name}
                        </motion.h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteTeam(team.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors p-2 hover:bg-red-900/20 rounded-lg"
                        >
                          Delete
                        </motion.button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {Array.from({ length: 6 }, (_, index) => {
                          const pokemon = team.pokemon[index];
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white/60 dark:bg-dark-700/30 backdrop-blur-sm rounded-xl p-3 text-center min-h-[100px] flex flex-col items-center justify-center"
                            >
                              {pokemon ? (
                                <>
                                  <motion.img
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                    src={pokemon.image}
                                    alt={pokemon.name}
                                    className="w-12 h-12 mb-2"
                                  />
                                  <p className="text-xs text-gray-800 dark:text-white capitalize truncate w-full">
                                    {pokemon.name}
                                  </p>
                                </>
                              ) : (
                                <div className="text-gray-500 dark:text-gray-400">
                                  <div className="w-8 h-8 mx-auto mb-1 bg-white/20 dark:bg-dark-600/50 rounded-full flex items-center justify-center">
                                    <span className="text-xs">+</span>
                                  </div>
                                  <p className="text-xs">Empty</p>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-dark-700/30 rounded-lg p-3">
                        <p>
                          {team.pokemon.length} Pokémon • Created {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MyTeamsPage;
