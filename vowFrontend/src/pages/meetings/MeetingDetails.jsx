import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getMeeting } from "../../services/api/meetingApi";
import { getMeetingAIResult } from "../../services/api/meetingAIApi";

import useAuth from "../../hooks/UseAuth";

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [meeting, setMeeting] = useState(null);

  const [aiResult, setAIResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadingAI, setLoadingAI] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMeeting(id);

        setMeeting(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id]);

  useEffect(() => {
    const loadAIResult = async () => {
      try {
        setLoadingAI(true);

        if (token) {
          const data = await getMeetingAIResult(id, token);

          if (data?.result) {
            setAIResult(data.result);

            return;
          }
        }

        const storedResult = sessionStorage.getItem(`deskverse_ai_${id}`);

        if (storedResult) {
          const parsedResult = JSON.parse(storedResult);

          setAIResult(parsedResult.result || null);
        }
      } catch (error) {
        console.error("Failed to load AI result:", error);

        try {
          const storedResult = sessionStorage.getItem(`deskverse_ai_${id}`);

          if (storedResult) {
            const parsedResult = JSON.parse(storedResult);

            setAIResult(parsedResult.result || null);
          }
        } catch {
          setAIResult(null);
        }
      } finally {
        setLoadingAI(false);
      }
    };

    loadAIResult();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
        <p className="text-sm text-slate-500">Loading meeting...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
        <button
          type="button"
          onClick={() => navigate("/meetings")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Meetings
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Meeting not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The meeting does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const startDate = new Date(meeting.startTime);

  const endDate = new Date(meeting.endTime);

  const participants = meeting.participants || [];

  const summary = aiResult?.summary;

  const actionItems = summary?.action_items || [];

  const keyDecisions = summary?.key_decisions || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
      <button
        type="button"
        onClick={() => navigate("/meetings")}
        className="mb-5 text-sm text-blue-600 hover:text-blue-700"
      >
        ← Back to Meetings
      </button>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {meeting.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {meeting.description || "Virtual Meeting"}
              </p>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              {meeting.status || "Scheduled"}
            </span>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Date</p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {startDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Time</p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {startDate.toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {endDate.toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Meeting Code</p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {meeting.meetingCode || "Not available"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Participants</p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {participants.length}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-base font-medium text-slate-800">
              Participants
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {participants.length === 0 ? (
                <p className="text-sm text-slate-500">No participants added.</p>
              ) : (
                participants.map((participant, index) => (
                  <div
                    key={`${participant}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <img
                      src={`/boy${(index % 6) + 1}.png`}
                      alt={participant}
                      className="h-8 w-8 rounded-full object-cover"
                    />

                    <span className="text-sm text-slate-700">
                      {participant}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Sparkles size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  AI Meeting Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI-generated insights from this meeting.
                </p>
              </div>
            </div>

            {aiResult && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-purple-600 shadow-sm">
                Generated by AI
              </span>
            )}
          </div>

          {loadingAI ? (
            <div className="mt-5 rounded-xl bg-white p-6">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-purple-600" />
                Loading AI insights...
              </div>
            </div>
          ) : !aiResult ? (
            <div className="mt-5 rounded-xl bg-white p-6">
              <div className="text-center">
                <Sparkles size={28} className="mx-auto text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No AI insights available
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  AI insights will appear here after the meeting is processed.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {summary?.executive_summary && (
                <div className="rounded-xl bg-white p-5">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-purple-600" />

                    <h3 className="font-semibold text-slate-900">
                      Executive Summary
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {summary.executive_summary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-5">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={18} className="text-blue-600" />

                    <h3 className="font-semibold text-slate-900">
                      Key Decisions
                    </h3>
                  </div>

                  {keyDecisions.length > 0 ? (
                    <ul className="mt-4 space-y-3">
                      {keyDecisions.map((decision, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-slate-600"
                        >
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-500"
                          />

                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      No key decisions identified.
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-white p-5">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-amber-600" />

                    <h3 className="font-semibold text-slate-900">
                      Action Items
                    </h3>
                  </div>

                  {actionItems.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {actionItems.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-slate-800">
                              {item.task}
                            </p>

                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">
                              {item.status || "TODO"}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-slate-500">
                            Assignee:{" "}
                            <span className="font-medium text-slate-700">
                              {item.assignee || "Unassigned"}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
                      No action items identified.
                    </p>
                  )}
                </div>
              </div>

              {aiResult.transcript && (
                <div className="rounded-xl bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-indigo-600" />

                      <h3 className="font-semibold text-slate-900">
                        Transcript
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 max-h-[400px] overflow-y-auto rounded-lg bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {aiResult.transcript}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => navigate(`/meetings/${meeting.id}/join`)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;
