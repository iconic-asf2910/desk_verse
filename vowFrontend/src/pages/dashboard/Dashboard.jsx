import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";
import { getWorkspaces } from "../../services/api/workspaceApi";

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomName, setRoomName] = useState("");

  const navigate = useNavigate();

  const {
    rooms,
    addRoom,
    removeRoom,
    setWorkspaceId,
    roomError,
    loadingRooms,
  } = useRoom();

  const roomPositions = {
    1: "left-[3%] top-[10%] w-[34%] h-[38%]",
    2: "left-[38%] top-[10%] w-[25%] h-[36%]",
    3: "left-[75%] top-[10%] w-[28%] h-[38%]",
    4: "left-[3%] bottom-[5%] w-[34%] h-[38%]",
    5: "left-[38%] bottom-[5%] w-[27%] h-[38%]",
    6: "left-[75%] bottom-[5%] w-[27%] h-[32%]",
  };

  const roomCharacters = {
    1: "/boy1.png",
    2: "/boy2.png",
    3: "/boy3.png",
    4: "/boy4.png",
    5: "/boy5.png",
    6: "/boy6.png",
  };

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setWorkspaceError("");

        const data = await getWorkspaces();

        setWorkspaces(data);

        if (data.length > 0) {
          setWorkspace(data[0].id);
          setWorkspaceId(data[0].id);
        }
      } catch (error) {
        setWorkspaceError(error.message);
      }
    };

    loadWorkspaces();
  }, [setWorkspaceId]);

  const handleWorkspaceChange = (event) => {
    const workspaceId = event.target.value;

    setWorkspace(workspaceId);
    setWorkspaceId(workspaceId);
  };

  const handleAddRoom = async (event) => {
    event.preventDefault();

    if (!roomName.trim()) {
      return;
    }

    await addRoom(roomName);

    setRoomName("");
    setShowAddRoom(false);
  };

  const handleRemoveRoom = async (roomId) => {
    const shouldRemove = window.confirm(
      "Are you sure you want to remove this room?"
    );

    if (!shouldRemove) {
      return;
    }

    await removeRoom(roomId);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-5 py-1">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Workspace Manager
          </h1>

          {workspaceError && (
            <p className="mt-1 text-sm text-red-500">
              {workspaceError}
            </p>
          )}

          {roomError && (
            <p className="mt-1 text-sm text-red-500">
              {roomError}
            </p>
          )}
        </div>

        <select
          value={workspace}
          onChange={handleWorkspaceChange}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
        >
          {workspaces.length === 0 ? (
            <option value="">
              No workspaces
            </option>
          ) : (
            workspaces.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-5">
        <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-slate-300 bg-white p-5">
          <div className="relative w-[78%] max-w-[700px]">
            <img
              src="/group2.jpeg"
              alt="Workspace floor plan"
              className="block w-full"
            />

            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => navigate(`/rooms/${room.id}`)}
                className={`absolute ${
                  roomPositions[room.id] ||
                  "left-[3%] top-[18%] w-[34%] h-[38%]"
                } flex flex-col items-center justify-center text-center`}
              >
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveRoom(room.id);
                  }}
                  className="absolute left-11 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-red-400 text-[10px] font-medium leading-none text-red-500 hover:bg-red-50"
                >
                  ×
                </span>

                <span className="text-xs font-medium text-slate-800">
                  {room.name}
                </span>

                <div className="mt-2 flex justify-center gap-2">
                  {(room.members || []).map((person, index) => (
                    <div
                      key={person || index}
                      className="flex flex-col items-center"
                    >
                      <img
                        src={
                          roomCharacters[room.id] ||
                          "/manprofile.png"
                        }
                        alt={person}
                        className="h-8 w-8 rounded-full object-cover"
                      />

                      <span className="mt-0.5 text-[9px] text-slate-700">
                        {person}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            ))}

            {loadingRooms && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-4 py-2 text-sm text-slate-500 shadow">
                Loading rooms...
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-300 bg-white p-5">
            <h2 className="text-base font-medium text-slate-800">
              Workspace Overview
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage your workspace rooms from the floor plan.
              Select a room to open its details or create a new room.
            </p>

            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Analytics →
            </button>
          </div>

          <div className="rounded-lg border border-slate-300 bg-white p-5">
            <h2 className="text-base font-medium text-slate-800">
              Rooms
            </h2>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {rooms.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Rooms in the selected workspace
            </p>
          </div>

          <div className="rounded-lg border border-slate-300 bg-white p-5">
            <h2 className="text-base font-medium text-slate-800">
              Quick Actions
            </h2>

            <button
              type="button"
              onClick={() => navigate("/meetings")}
              className="mt-4 w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View Meetings
            </button>

            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="mt-2 w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View Tasks
            </button>
          </div>
        </div>
      </div>

      <div className="mt-1 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAddRoom(true)}
          className="mr-68 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Room
        </button>
      </div>

      {showAddRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Add Room
            </h2>

            <form onSubmit={handleAddRoom} className="mt-5">
              <input
                type="text"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Room name"
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRoom(false);
                    setRoomName("");
                  }}
                  className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;