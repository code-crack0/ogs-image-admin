"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  UserCircleIcon,
  CogIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [folders, setFolders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [userName, setUserName] = useState("User");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
      } else {
        setUserName(data.user.user_metadata?.name || "User");
        fetchFolders(sortOrder);
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, [router, supabase, sortOrder]);

  const fetchFolders = async (order = "desc") => {
    setLoading(true);
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .order("created_at", { ascending: order === "asc" });

    if (error) {
      console.error("Error fetching folders:", error.message);
    } else {
      setFolders(data || []);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .ilike("name", `%${searchQuery}%`);

    if (error) {
      console.error("Error searching folders:", error.message);
    } else {
      setFolders(data || []);
    }
    setLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("folders")
      .insert([{ name: newFolderName, created_at: new Date() }])
      .select();

    if (error) {
      console.error("Error creating folder:", error.message);
    } else {
      setFolders((prev) => [...prev, ...data]);
      setNewFolderName("");
      setModalOpen(false);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
    router.push("/login");
  };

  const handleSortChange = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const renderFolders = () =>
    folders.map((folder) => (
      <div
        key={folder.id}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={() => router.push(`/folder/${folder.id}`)}
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FolderIcon className="h-8 w-8 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">{folder.name}</h3>
          </div>
          <p className="text-sm text-gray-500">
            Created: {new Date(folder.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    ));

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Hello, {userName}</h1>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                <UserCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex px-4 py-2 text-sm`}
                      >
                        <CogIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/logs"
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex px-4 py-2 text-sm`}
                      >
                        <BookOpenIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Logs
                      </Link>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex px-4 py-2 text-sm`}
                        onClick={handleLogout}
                      >
                        Logout
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button
            onClick={handleSearch}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Search
          </button>
          <button
            onClick={handleSortChange}
            className="ml-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300 flex items-center"
          >
            <ChevronUpDownIcon className="h-5 w-5 mr-2" />
            {sortOrder === "asc" ? "Oldest" : "Newest"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderFolders()}
          </div>
        )}

        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
        >
          <PlusIcon className="h-6 w-6" />
        </button>

        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <Dialog.Title className="text-xl font-semibold mb-4">Create New Folder</Dialog.Title>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleCreateFolder}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-600 transition-colors duration-300"
                >
                  Create
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  );
}