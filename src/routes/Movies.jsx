import Genres from "../components/Genres";
import { ButtonGroup } from "flowbite-react";
import { getMovies } from "../api/movies";
import { useState, useEffect, useCallback } from "react";
import MovieList from "../components/MovieList";
import { FaSearch } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import CardSkeleton from "../components/CardSkeleton";
// import { debounce } from "lodash";
import debounce from "lodash.debounce";

export default function Movies() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadMoreMovies();
  }, []);

  const removeDuplicates = (movies) => {
    const map = new Map();
    movies.forEach((movie) => map.set(movie.id, movie));
    return Array.from(map.values());
  };

  const loadMoreMovies = async () => {
    try {
      const newMovies = await getMovies(page);

      if (newMovies.length === 0) {
        setHasMore(false);
        return;
      }

      setMovies((prevMovies) =>
        removeDuplicates([...prevMovies, ...newMovies])
      );
      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      console.error("Failed to load movies:", err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllMovies = async (maxPages = 5) => {
    let allMovies = [];
    let page = 1;

    while (page <= maxPages) {
      const data = await getMovies(page);
      if (data.length === 0) {
        break;
      }
      allMovies = [...allMovies, ...data];
      page += 1;
    }

    return allMovies;
  };

  const handleChange = async (value) => {
    setInput(value);

    if (value.trim() === "") {
      setResult([]);
      setHasMore(true);
      setIsLoading(true);
      setMovies([]);
      setPage(1);
      await loadMoreMovies();
    } else {
      setIsLoading(true);
      try {
        const allMovies = await fetchAllMovies();
        const filtered = allMovies.filter((movie) =>
          movie.title.toLowerCase().includes(value.toLowerCase())
        );
        setResult(filtered);
        setHasMore(false);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="text-white mt-20 mb-10">
        <h1 className="font-bold text-8xl">
          IMDb
          <span className="text-xl font-normal pl-1">
            Top <span className="text-violet-400">250</span> Movies
          </span>
        </h1>
        <p className="text-base text-gray-400 mt-5 font-light">
          <span className="text-violet-400">IMDb</span> is the world's most
          popular and authoritative source for <br />
          movie, TV and celebrity content. Find ratings and details <br /> of
          the movie and TV shows!
        </p>
      </div>

      <div className="flex mb-9 items-center">
        <FaSearch className="text-gray-500 m-2" id="search-icon" />
        <input
          type="search"
          placeholder="Search Movies or TV Shows"
          value={input}
          onChange={async (e) => {
            await handleChange(e.target.value);
          }}
          className="bg-slate-950 bg-opacity-25 text-gray-400 border-2 border-gray-700 rounded-xl focus:border-opacity-10 w-72 h-14"
        />
      </div>

      <ButtonGroup className="bg-black bg-opacity-10 p-2.5 rounded-xl flex flex-wrap justify-between m-auto px-4">
        <Genres />
      </ButtonGroup>

      <h1 className="text-3xl font-semibold text-gray-500 text mt-6 ml-2">
        All
        <p className="inline text-lg font-normal">&nbsp;(250)</p>
      </h1>
      <InfiniteScroll
        dataLength={movies.length}
        next={loadMoreMovies}
        hasMore={hasMore && input.trim() === ""}
        loader={
          <div className="flex gap-7">
            <CardSkeleton cards={4} />
          </div>
        }
        endMessage={
          <p className="text-gray-600 mt-6 text-center font-light">
            <b>There are no more movies to load...</b>
          </p>
        }
      >
        <MovieList
          movies={input.trim() ? result : movies}
          isLoading={isLoading}
        />
      </InfiniteScroll>
    </>
  );
}
