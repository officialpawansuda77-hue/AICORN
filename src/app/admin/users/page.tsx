"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield, Ban, CheckCircle2, UserCheck } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput } from "@/components/ui/glass-input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { demoProfiles } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState(demoProfiles);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_banned: !u.is_banned } : u))
    );
    toast("User status updated", "info");
  };

  const togglePlan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, plan: u.plan === "pro" ? "free" : "pro" } : u))
    );
    toast("User plan changed", "success");
  };

  const changeRole = (id: string, role: "explorer" | "creator" | "admin") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
    toast(`User role updated to ${role}`, "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            User Management
          </h1>
          <p className="text-xs text-white/50">{users.length} registered accounts</p>
        </div>
      </div>

      <GlassInput
        placeholder="Filter users by name or @username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <GlassPanel rounded="3xl" className="overflow-hidden bg-white/[0.03] border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-white/50 sticky top-0">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium text-center">Role</th>
                <th className="p-4 font-medium text-center">Plan</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar_url} name={user.display_name} size="md" />
                      <div>
                        <p className="text-xs font-semibold text-white">{user.display_name}</p>
                        <p className="text-[11px] text-white/40">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value as any)}
                      className="bg-[#14161a] border border-white/10 text-xs text-white rounded-lg px-2.5 py-1 outline-none"
                    >
                      <option value="explorer">Explorer</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => togglePlan(user.id)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                        user.plan === "pro"
                          ? "bg-[#FFB020] text-[#08090B]"
                          : "bg-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {user.plan}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                        user.is_banned
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      )}
                    >
                      {user.is_banned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleBan(user.id)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        user.is_banned
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      )}
                    >
                      {user.is_banned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
