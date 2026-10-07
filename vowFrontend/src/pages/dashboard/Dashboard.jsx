import { useMemo, useState } from "react";

import {
  BarChart3,
  ChevronDown,
  Grid2X2,
  List,
  MoreVertical,
  Plus,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useRoom from "../../hooks/UseRoom";
import useWorkspace from "../../hooks/UseWorkspace";
import { addWorkspaceMember } from "../../services/api/workspaceApi";
import useAuth from "../../hooks/UseAuth";

const roomImages = [
  "/group.png",
  "/group2.jpeg",
  "/meet.png",
  "/projector.png",
  "/tab.png",
  "/video.png",
];

const roomColors = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-orange-100 text-orange-600",
  "bg-cyan-100 text-cyan-600",
  "bg-rose-100 text-rose-600",
];

const getRoomStatus = (room, index) => {
  if (room.status) {
    const status = room.status.toLowerCase();

    if (
      status === "active" ||
      status === "available" ||
      status === "in_meeting"
    ) {
      return status;
    }
  }

  if (index % 3 === 0) {
    return "active";
  }

  if (index % 3 === 1) {
    return "in_meeting";
  }

  return "available";
};

const Dashboard = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    workspace,
    workspaces,
    selectWorkspace,
    addWorkspace,
    workspaceError,
    loadingWorkspaces,
    creatingWorkspace,
  } = useWorkspace();

  const { rooms, addRoom, removeRoom, roomError, loadingRooms } = useRoom();

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomName, setRoomName] = useState("");

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberSuccess, setMemberSuccess] = useState("");
  const [memberError, setMemberError] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceCreateError, setWorkspaceCreateError] = useState("");

  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [openMenu, setOpenMenu] = useState(null);

  const availableRooms = useMemo(() => {
    return rooms.filter(
      (room, index) => getRoomStatus(room, index) === "available",
    );
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room, index) => {
      const matchesSearch = room.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const status = getRoomStatus(room, index);

      const matchesFilter = roomFilter === "all" || status === roomFilter;

      return matchesSearch && matchesFilter;
    });
  }, [rooms, search, roomFilter]);

  const handleWorkspaceChange = (event) => {
    selectWorkspace(event.target.value);
  };

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();

    if (!workspaceName.trim()) {
      setWorkspaceCreateError("Workspace name is required.");
      return;
    }

    try {
      setWorkspaceCreateError("");

      await addWorkspace({
        name: workspaceName,
        description: workspaceDescription,
      });

      setWorkspaceName("");
      setWorkspaceDescription("");
      setShowCreateWorkspace(false);
    } catch (error) {
      setWorkspaceCreateError(error.message);
    }
  };

  const handleAddRoom = async (event) => {
    event.preventDefault();

    if (!roomName.trim()) {
      return;
    }

    try {
      await addRoom(roomName);

      setRoomName("");
      setShowAddRoom(false);
    } catch {}
  };

  const handleRemoveRoom = async (roomId) => {
    const shouldRemove = window.confirm(
      "Are you sure you want to remove this room?",
    );

    if (!shouldRemove) {
      return;
    }

    try {
      await removeRoom(roomId);
    } catch {}
  };

  const handleViewAnalytics = () => {
    navigate("/analytics");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fc] px-5 py-6 sm:px-7">
      <div className="mx-auto max-w-[1500px]">
        {(workspaceError || roomError) && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {workspaceError || roomError}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                {workspace?.name || "Workspace"}
              </h1>

              <div className="relative">
                <select
                  value={workspace?.id || ""}
                  onChange={handleWorkspaceChange}
                  disabled={loadingWorkspaces}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300"
                >
                  {workspaces.length === 0 ? (
                    <option value="">
                      {loadingWorkspaces ? "Loading..." : "No workspaces"}
                    </option>
                  ) : (
                    workspaces.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))
                  )}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-slate-500">
                {rooms.length} rooms
              </span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="text-sm text-slate-500">
                {workspace?.description || "Manage your team workspace"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3">
              <Search size={17} className="text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rooms..."
                className="ml-2 w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowCreateWorkspace(true)}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Plus size={17} />
              Workspace
            </button>

            <button
              type="button"
              onClick={() => setShowManageMembers(true)}
              disabled={!workspace}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Users size={17} />
              Manage Members
            </button>

            <button
              type="button"
              onClick={() => setShowAddRoom(true)}
              disabled={!workspace}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#6254f5] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#5144e7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              Add Room
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Grid2X2 size={20} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Workspace
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-slate-900">
              {rooms.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">Total Rooms</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Users size={20} />
              </div>

              <span className="text-xs font-medium text-slate-400">Team</span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-slate-900">
              {rooms.reduce(
                (total, room) => total + (room.members?.length || 0),
                0,
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">Members in Rooms</p>
          </div>

          <button
            type="button"
            onClick={handleViewAnalytics}
            className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white">
                <BarChart3 size={20} />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Analytics
              </span>
            </div>

            <p className="mt-4 text-lg font-semibold text-slate-900">
              View Analytics
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Track workspace activity
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
          <section className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Rooms</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage and join your workspace rooms
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[
                  {
                    id: "all",
                    label: `All Rooms (${rooms.length})`,
                  },
                  {
                    id: "available",
                    label: `Available (${availableRooms.length})`,
                  },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setRoomFilter(filter.id)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      roomFilter === filter.id
                        ? "bg-[#6254f5] text-white"
                        : "bg-white text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}

                <div className="ml-1 flex rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-md p-1.5 ${
                      viewMode === "grid"
                        ? "bg-slate-100 text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    <Grid2X2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`rounded-md p-1.5 ${
                      viewMode === "list"
                        ? "bg-slate-100 text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {loadingRooms ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white">
                <p className="text-sm text-slate-500">Loading rooms...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Grid2X2 size={22} className="text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                  No rooms found
                </h3>

                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Create a room or change your search and filters.
                </p>

                <button
                  type="button"
                  onClick={() => setShowAddRoom(true)}
                  disabled={!workspace}
                  className="mt-4 rounded-lg bg-[#6254f5] px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  Create Room
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
                    : "space-y-3"
                }
              >
                {filteredRooms.map((room) => {
                  const originalIndex = rooms.findIndex(
                    (item) => item.id === room.id,
                  );

                  const image =
                    room.image || roomImages[originalIndex % roomImages.length];

                  const color = roomColors[originalIndex % roomColors.length];

                  return (
                    <div
                      key={room.id}
                      className={`group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list" ? "h-32 w-52 shrink-0" : "h-40"
                        }`}
                      >
                        <img
                          src={image}
                          alt={room.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                        <div className="absolute right-3 top-3">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(openMenu === room.id ? null : room.id)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm backdrop-blur hover:bg-white"
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenu === room.id && (
                            <div className="absolute right-0 top-9 z-20 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  navigate(`/rooms/${room.id}`);
                                }}
                                className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                              >
                                View Room
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  handleRemoveRoom(room.id);
                                }}
                                className="w-full rounded-md px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50"
                              >
                                Delete Room
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}
                              >
                                <Video size={15} />
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-slate-900">
                                  {room.name}
                                </h3>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                  {room.members?.length || 0} members
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(`/rooms/${room.id}`)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            Open
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {(room.members || [])
                              .slice(0, 4)
                              .map((member, index) => (
                                <div
                                  key={`${member}-${index}`}
                                  className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100"
                                >
                                  <img
                                    src="/manprofile.png"
                                    alt={member}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}

                            {(room.members || []).length > 4 && (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-semibold text-slate-600">
                                +{room.members.length - 4}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(`/rooms/${room.id}`)}
                            className="text-xs font-medium text-[#6254f5] hover:text-[#5144e7]"
                          >
                            Join Room →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Your Workspace
                </h2>

                <button
                  type="button"
                  onClick={() => navigate("/workspaces")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <img
                  src="/manprofile.png"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name || "Workspace Member"}
                  </p>

                  <p className="text-xs text-slate-500">Workspace member</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-lg font-semibold text-slate-900">
                    {rooms.length}
                  </p>

                  <p className="text-[10px] text-slate-500">Rooms</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {showManageMembers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Workspace Members</h2>
                  <p className="mt-1 text-xs text-slate-500">Invite members to {workspace?.name || "this workspace"}.</p>
                </div>
                <button type="button" onClick={() => { setShowManageMembers(false); setMemberEmail(""); setMemberSuccess(""); setMemberError(""); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={17} /></button>
              </div>

              {workspace?.members && workspace.members.length > 0 && (
                <div className="mt-5 max-h-48 overflow-y-auto">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Members</h3>
                  <ul className="mt-2 divide-y divide-slate-100">
                    {workspace.members.map((m) => (
                      <li key={m.id || m.email} className="flex items-center gap-3 py-2 text-sm text-slate-800">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">{m.name ? m.name[0] : (m.email ? m.email[0] : "?")}</div>
                        <div>
                          <p className="font-medium">{m.name || m.email || "Unknown"}</p>
                          {m.email && <p className="text-xs text-slate-500">{m.email}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5">
                <label htmlFor="dashboard-member-email" className="mb-1 block text-sm font-medium text-slate-700">Enter member email</label>
                <input id="dashboard-member-email" type="email" value={memberEmail} onChange={(e) => { setMemberEmail(e.target.value); setMemberError(""); setMemberSuccess(""); }} placeholder="user@example.com" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#6254f5] focus:ring-2 focus:ring-[#6254f5]/10" />
              </div>

              {memberSuccess && <p className="mt-3 text-sm text-emerald-600">{memberSuccess}</p>}
              {memberError && <p className="mt-3 text-sm text-red-600">{memberError}</p>}

              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowManageMembers(false); setMemberEmail(""); setMemberSuccess(""); setMemberError(""); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={async () => { setMemberError(""); setMemberSuccess(""); if (!memberEmail.trim()) { setMemberError("Please enter an email."); return; } setMemberLoading(true); try { await addWorkspaceMember(workspace?.id, memberEmail.trim()); setMemberSuccess("Member added."); setMemberEmail(""); try { const refreshed = await import("../../services/api/workspaceApi").then(m => m.getWorkspace ? m.getWorkspace(workspace.id) : null); } catch {} } catch (err) { const msg = err?.message || "Failed to add member."; if (msg.toLowerCase().includes("not found")) setMemberError("User not found."); else if (msg.toLowerCase().includes("already")) setMemberError("Already a member."); else if (msg.toLowerCase().includes("unauthorized")) setMemberError("Unauthorized."); else if (msg.toLowerCase().includes("forbidden")) setMemberError("No permission."); else setMemberError(msg); } finally { setMemberLoading(false); } }} disabled={memberLoading} className="rounded-lg bg-[#6254f5] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5144e7] disabled:opacity-60">{memberLoading ? "Adding..." : "Add Member"}</button>
              </div>
            </div>
          </div>
        )}

        {showAddRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Add Room
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Create a new room in this workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddRoom(false);
                    setRoomName("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={handleAddRoom} className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Room Name
                </label>

                <input
                  type="text"
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  placeholder="e.g. Design Studio"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#6254f5] focus:ring-2 focus:ring-[#6254f5]/10"
                />

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddRoom(false);
                      setRoomName("");
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#6254f5] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5144e7]"
                  >
                    Add Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCreateWorkspace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Create Workspace
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a new workspace for your team.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateWorkspace(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X size={17} />
                </button>
              </div>

              {workspaceCreateError && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {workspaceCreateError}
                </div>
              )}

              <form onSubmit={handleCreateWorkspace} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Workspace Name
                  </label>

                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    placeholder="e.g. Product Team"
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#6254f5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={workspaceDescription}
                    onChange={(event) =>
                      setWorkspaceDescription(event.target.value)
                    }
                    placeholder="Describe your workspace"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#6254f5]"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateWorkspace(false);
                      setWorkspaceName("");
                      setWorkspaceDescription("");
                      setWorkspaceCreateError("");
                    }}
                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creatingWorkspace}
                    className="rounded-lg bg-[#6254f5] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5144e7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingWorkspace ? "Creating..." : "Create Workspace"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
