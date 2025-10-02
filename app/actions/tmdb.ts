"use server"

interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  runtime: number
  genres: { id: number; name: string }[]
}

interface TMDBTVShow {
  id: number
  name: string
  overview: string
  poster_path: string
  first_air_date: string
  vote_average: number
  number_of_seasons: number
  genres: { id: number; name: string }[]
}

export async function fetchMovieData(id: string): Promise<TMDBMovie | null> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY

  if (!TMDB_API_KEY) {
    console.log("[v0] TMDB API key is not configured - skipping movie data fetch")
    return null
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch movie data:", response.status)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Error fetching movie data:", error)
    return null
  }
}

export async function fetchTVData(id: string): Promise<TMDBTVShow | null> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY

  if (!TMDB_API_KEY) {
    console.log("[v0] TMDB API key is not configured - skipping TV data fetch")
    return null
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch TV data:", response.status)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Error fetching TV data:", error)
    return null
  }
}
