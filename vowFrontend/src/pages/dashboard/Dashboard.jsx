import { useState } from "react";

const Dashboard = () => {
  const [workspace, setWorkspace] = useState("Acme Corp HQ");

  const rooms = [
    {
      id: 1,
      name: "Design Studio",
      position: "left-[3%] top-[18%] w-[34%] h-[38%]",
      people: ["Sarah", "Mike"],
    },
    {
      id: 2,
      name: "Meeting Pod A",
      position: "left-[38%] top-[10%] w-[25%] h-[36%]",
      people: ["Alex"],
    },
    {
      id: 3,
      name: "Meeting Pod B",
      position: "right-[3%] top-[10%] w-[28%] h-[38%]",
      people: ["Emma"],
    },
    {
      id: 4,
      name: "The Lounge",
      position: "left-[3%] bottom-[5%] w-[34%] h-[38%]",
      people: ["Sophia"],
    },
    {
      id: 5,
      name: "Engineering Bay",
      position: "left-[38%] bottom-[5%] w-[27%] h-[38%]",
      people: ["David"],
    },
    {
      id: 6,
      name: "Quiet Room",
      position: "right-[3%] bottom-[5%] w-[27%] h-[32%]",
      people: ["Ryan"],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-5 py-5">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Workspace Manager
        </h1>

        <select
          value={workspace}
          onChange={(event) => setWorkspace(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
        >
          <option>Acme Corp HQ</option>
          <option>Delhi Office</option>
          <option>Mumbai Office</option>
        </select>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-5">
        <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-slate-300 bg-white p-5">
          <div className="relative w-[78%] max-w-[700px]">
            <img
              src="/group.png"
              alt="Workspace floor plan"
              className="block w-full"
            />

            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className={`absolute ${room.position} flex flex-col items-center justify-center text-center`}
              >
                <span className="text-xs font-medium text-slate-800">
                  {room.name}
                </span>

                <div className="mt-2 flex justify-center gap-2">
                  {room.people.map((person) => (
                    <div
                      key={person}
                      className="flex flex-col items-center"
                    >
                      <img
                        src="/manprofile.png"
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
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-5">
            <h2 className="mb-4 text-base font-medium text-slate-800">
              Workspace Analytics
            </h2>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 text-sm font-medium text-emerald-700">
                96%
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p>Attendance: 96%</p>
                <p>Engagement: High</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-300 bg-white p-5">
            <h2 className="mb-3 text-base font-medium text-slate-800">
              Pending Tasks
            </h2>

            <ol className="list-decimal space-y-2 pl-5 text-sm leading-5 text-slate-600">
              <li>Review Design Specs</li>
              <li>Complete Onboarding Call</li>
              <li>Q4 Planning Prep</li>
            </ol>
          </div>

          <div className="rounded-lg border border-slate-300 bg-white p-5">
            <h2 className="mb-3 text-base font-medium text-slate-800">
              AI Meeting Summaries
            </h2>

            <ol className="list-decimal space-y-2 pl-5 text-sm leading-5 text-slate-600">
              <li>Q3 Sync Notes</li>
              <li>Feature Brainstorm</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-1 flex justify-center">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-6 py-2.5  text-sm font-medium mr-68 text-white hover:bg-blue-700"
        >
          + Add Room
        </button>
      </div>
    </div>
  );
};

export default Dashboard;