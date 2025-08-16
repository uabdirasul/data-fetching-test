"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [activeSearch, setActiveSearch] = useState(searchParams.get("q") || "");

  const fetchJobs = async ({
    page,
    search
  }: {
    page: number;
    search?: string;
  }) => {
    const offset = (page - 1) * 10; // Calculate offset for pagination
    let url = `https://remotive.com/api/remote-jobs?limit=10&offset=${offset}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["remoteJobs", currentPage, activeSearch],
    queryFn: () => fetchJobs({ page: currentPage, search: activeSearch }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const totalJobs = data["total-job-count"] || 0;
  const totalPages = Math.ceil(totalJobs / 10);
  const currentJobs = data.jobs || [];

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("q", searchTerm);
    }
    router.push(`?${params.toString()}`);
    setActiveSearch(searchTerm); // Update the active search term
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch(""); // Clear the active search term
    router.push("/");
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-2 mx-1 rounded transition-colors ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="container max-w-[80%] mx-auto p-4">
      <Link href={"/"}>
        <h1 className="text-3xl font-bold text-center mb-8">Remote Jobs</h1>
      </Link>

      {/* Search Form */}
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
              onClick={clearSearch}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Jobs Grid */}
      <div className="grid gap-6">
        {currentJobs.map((job: any) => (
          <div
            key={job.id}
            className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <img
                src={job.company_logo_url || job.company_logo}
                alt={job.company_name}
                className="w-16 h-16 object-contain bg-white border rounded"
                width={64}
                height={64}
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {job.title}
                  </a>
                </h2>
                <p className="text-gray-600 mb-2">
                  Company: {job.company_name}
                </p>
                <p className="text-gray-600 mb-2">Category: {job.category}</p>
                <p className="text-gray-600 mb-2">
                  Location: {job.candidate_required_location}
                </p>
                <p className="text-gray-600 mb-2">Salary: {job.salary}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.tags &&
                    job.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} ({totalJobs} total jobs)
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* First Page */}
          {currentPage > 1 && (
            <button
              onClick={() => goToPage(1)}
              className="px-3 py-2 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              First
            </button>
          )}

          {/* Previous Page */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 mx-1 rounded transition-colors ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {renderPageNumbers()}

          {/* Next Page */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 mx-1 rounded transition-colors ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Next
          </button>

          {/* Last Page */}
          {currentPage < totalPages && (
            <button
              onClick={() => goToPage(totalPages)}
              className="px-3 py-2 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Last
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
