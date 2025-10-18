import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Pokemon {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  owner_id: number;
  pokemon: Pokemon[];
}

export interface TeamCreate {
  name: string;
  pokemon: { name: string }[];
}

// Teams API functions
export const teamsAPI = {
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams/');
    return response.data;
  },

  getTeam: async (teamId: number): Promise<Team> => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  createTeam: async (teamData: TeamCreate): Promise<Team> => {
    const response = await api.post('/teams/', teamData);
    return response.data;
  },

  updateTeam: async (teamId: number, teamData: TeamCreate): Promise<Team> => {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  deleteTeam: async (teamId: number): Promise<void> => {
    await api.delete(`/teams/${teamId}`);
  },
};

// Pokemon API functions (using external PokeAPI)
export const pokemonAPI = {
  searchPokemon: async (name: string) => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      return {
        id: response.data.id,
        name: response.data.name,
        image: response.data.sprites.front_default,
        types: response.data.types.map((type: any) => type.type.name),
      };
    } catch (error) {
      throw new Error(`Pokemon "${name}" not found`);
    }
  },

  getPokemonByName: async (name: string) => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      return {
        id: response.data.id,
        name: response.data.name,
        image: response.data.sprites.front_default,
        types: response.data.types.map((type: any) => type.type.name),
      };
    } catch (error) {
      throw new Error(`Pokemon with name ${name} not found`);
    }
  },
};
