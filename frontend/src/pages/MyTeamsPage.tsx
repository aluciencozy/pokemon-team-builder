import React, { useState, useEffect } from 'react';
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

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const fetchedTeams = await teamsAPI.getTeams();

      // Fetch Pokemon images for each team
      const teamsWithImages = await Promise.all(
        fetchedTeams.map(async (team) => {
          console.log(team);
          const pokemonWithImages = await Promise.all(
            team.pokemon.map(async (pokemon) => {
              try {
                const pokemonData = await pokemonAPI.getPokemonByName(pokemon.name);
                return {
                  ...pokemon,
                  image: pokemonData.image,
                };
              } catch (error) {
                // If Pokemon not found, return with placeholder
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

  const deleteTeam = async (teamId: number) => {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Teams</h1>
          <p className="text-lg text-gray-600 mb-8">Please log in to view your saved teams.</p>
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Teams</h1>
          <p className="text-lg text-gray-600">Manage your saved Pokémon teams</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-4xl text-gray-400">🎮</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-6">Start building your first Pokémon team!</p>
            <a
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Build Team
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {Array.from({ length: 6 }, (_, index) => {
                      const pokemon = team.pokemon[index];
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-2 text-center min-h-[80px] flex flex-col items-center justify-center"
                        >
                          {pokemon ? (
                            <>
                              <img
                                src={pokemon.image}
                                alt={pokemon.name}
                                className="w-12 h-12 mb-1"
                              />
                              <p className="text-xs text-gray-700 capitalize truncate w-full">
                                {pokemon.name}
                              </p>
                            </>
                          ) : (
                            <div className="text-gray-400">
                              <div className="w-8 h-8 mx-auto mb-1 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs">+</span>
                              </div>
                              <p className="text-xs">Empty</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      {team.pokemon.length} Pokémon • Created {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeamsPage;
