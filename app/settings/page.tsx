"use client";

import { Fragment, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast, Toaster } from "react-hot-toast";
import { Loader2, RefreshCw, Edit, UserCircleIcon, CogIcon, BookOpenIcon } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { set } from "date-fns";

interface User {
  id: string;
  email?: string;
}

interface Role {
  user_email: string;
  user_name: string;
  user_role: string;
  user_permissions: string[];
}

const SettingsPage = () => {
  const router = useRouter();
  const supabase = createClient();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [canUploadImage, setCanUploadImage] = useState(false);
  const [canCreateFolder, setCanCreateFolder] = useState(false);
  const [canDeleteFolder, setCanDeleteFolder] = useState(false);

  const [editRole, setEditRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.getUser();

      if (!data?.user || error) {
        router.push("/login");
      } else {
        const user = data.user;
        console.log("User:",user);
        setUserName(user?.user_metadata.name);
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("user_role")
          .eq("user_email", user.email)
          .single();

        if (roleData?.user_role) {
          setCurrentUserRole(roleData.user_role);
          if ( roleData.user_role !== "superadmin") {
            toast.error("You do not have permission to access this page.");
            router.push("/dashboard");
          }
        } else {
          toast.error("Failed to fetch user role.");
          router.push("/dashboard");
        }
      }

      setAuthLoading(false);
    };

    checkAuth();
    fetchUsers();
    fetchRoles();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin-users");
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        toast.error(`Error fetching users: ${data.error}`);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin-roles");
      const data = await response.json();
      if (response.ok) {
        setRoles(data.roles || []);
      } else {
        toast.error(`Error fetching roles: ${data.error}`);
      }
    } catch (error) {
      toast.error("Failed to fetch roles");
    }
    setLoading(false);
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== "superadmin") {
      toast.error("You do not have permission to add users.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: name,
          isAdmin,
          canUploadImage,
          canCreateFolder,
          canDeleteFolder,
        }),
      });
      if (response.ok) {
        toast.success("User added successfully");
        fetchUsers();
        fetchRoles();
        setNewUserEmail("");
        setNewUserPassword("");
        setIsAdmin(false);
        setCanUploadImage(false);
        setCanCreateFolder(false);
      } else {
        const data = await response.json();
        toast.error(`Error creating user: ${data.error}`);
      }
    } catch (error) {
      toast.error("Failed to add user");
    }
    setLoading(false);
  };

  const updateRole = async () => {
    if (!editRole) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin-roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: editRole.user_email,
          user_role: newRole,
          user_permissions: newPermissions,
        }),
      });
      if (response.ok) {
        toast.success("Role updated successfully");
        fetchRoles();
        setEditRole(null);
      } else {
        const data = await response.json();
        toast.error(`Error updating role: ${data.error}`);
      }
    } catch (error) {
      toast.error("Failed to update role");
    }
    setLoading(false);
  };
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
    setAuthLoading(true);
    router.push("/login");
    setAuthLoading(false);
  };
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
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
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Users</h2>
            <Button onClick={fetchRoles} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.user_email}>
                  <TableCell>{role.user_email}</TableCell>
                  <TableCell>{role.user_role}</TableCell>
                  <TableCell>{role.user_permissions.join(", ")}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditRole(role);
                            setNewRole(role.user_role);
                            setNewPermissions(role.user_permissions);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Role and Permissions</DialogTitle>
                          <DialogDescription>
                            Update role and permissions for {role.user_email}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <label className="block mb-2 text-sm font-medium">
                            Role
                          </label>
                          <select
                            className="w-full p-2 border rounded"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            required
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                        </div>
                        <div className="mt-4 space-y-2">
                          <label className="block mb-2 text-sm font-medium">
                            Permissions
                          </label>
                          {["upload", "create", "delete"].map((permission) => (
                            <div key={permission} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newPermissions.includes(permission)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewPermissions([
                                      ...newPermissions,
                                      permission,
                                    ]);
                                  } else {
                                    setNewPermissions(
                                      newPermissions.filter(
                                        (p) => p !== permission
                                      )
                                    );
                                  }
                                }}
                                className="mr-2"
                              />
                              <label>{permission}</label>
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                          <Button onClick={updateRole} disabled={loading}>
                            {loading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Update"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addUser} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="isAdmin"
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => setIsAdmin(e.target.checked)}
                    />
                    <label htmlFor="isAdmin">Admin Rights</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="canUploadImage"
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => setCanUploadImage(e.target.checked)}
                    />
                    <label htmlFor="canUploadImage">Upload Image Access</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="canCreateFolder"
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => setCanCreateFolder(e.target.checked)}
                    />
                    <label htmlFor="canCreateFolder">
                      Create Folder Access
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="canDeleteFolder"
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => setCanDeleteFolder(e.target.checked)}
                    />
                    <label htmlFor="canDeleteFolder">Delete Access</label>
                  </div>
                </div>
                <Button type="submit" disabled={loading || currentUserRole !== "superadmin"}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Add User"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
