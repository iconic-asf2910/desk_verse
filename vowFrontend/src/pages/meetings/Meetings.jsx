import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreHorizontal, Search } from "lucide-react";
import { getMeetings } from "../../utils/meetingStorage";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  const avatars = [
    "/boy1.png",
    "/boy2.png",
    "/boy3.png",
    "/boy4.png",
    "/boy5.png",
    "/boy6.png",
  ];

  const filteredMeetings = meetings.filter((meeting) => {
    const searchText = search.toLowerCase();

    return (
      meeting.title.toLowerCase().includes(searchText) ||
      (meeting.description || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          Meeting
        </h1>

        <div className="flex items-center gap-2">
          {showSearch && (
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search meetings..."
              autoFocus
              className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
            />
          )}

          <button
            type="button"
            onClick={() => {
              setShowSearch((previous) => !previous);

              if (showSearch) {
                setSearch("");
              }
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Search size={16} strokeWidth={1.8} />
            Search
          </button>

          <Link
            to="/meetings/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Schedule New Meeting
          </Link>
        </div>
      </div>

      <div className="space-y-5">
        {filteredMeetings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              {search
                ? "No meetings match your search."
                : "No meetings found."}
            </p>
          </div>
        ) : (
          filteredMeetings.map((meeting, index) => (
            <div
              key={meeting.id}
              className="rounded-xl border border-slate-300 bg-white px-4 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-center justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-medium text-slate-900">
                    {meeting.title}
                  </h2>

                  <div className="mt-2 flex items-center">
                    {avatars.map((avatar) => (
                      <img
                        key={avatar}
                        src={avatar}
                        alt="Participant"
                        className="-ml-1 h-8 w-8 rounded-full border-2 border-white object-cover first:ml-0"
                      />
                    ))}
                  </div>

                  <div className="mt-3 space-y-0.5 text-sm text-slate-700">
                    <p>
                      {new Date(
                        meeting.startTime
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      {new Date(
                        meeting.startTime
                      ).toLocaleTimeString("en-IN", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(
                        meeting.endTime
                      ).toLocaleTimeString("en-IN", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>

                    <p>
                      {meeting.description || "Virtual Meeting"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/meetings/${meeting.id}/join`)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      index === 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-300 text-white"
                    }`}
                  >
                    {index === 0 ? "Join Now" : "Join"}
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100"
                  >
                    <MoreHorizontal size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Meetings;