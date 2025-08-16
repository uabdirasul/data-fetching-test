import { useRouter } from "next/navigation";
import { useState } from "react";

const SearchJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("q", searchTerm);
    }
    router.push(`?${params.toString()}`);
  }
  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search jobs..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              router.push("/");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchJobs;
