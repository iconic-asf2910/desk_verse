import {
  createContext,
  useEffect,
  useState,
} from "react";

import useAuth from "../hooks/UseAuth";
import useWorkspace from "../hooks/UseWorkspace";

import {
  getPresence,
  updatePresence,
} from "../services/api/presenceApi";

const PresenceContext =
  createContext();

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

const PresenceProvider = ({
  children,
}) => {
  const { user } = useAuth();
  const { workspace } =
    useWorkspace();

  const [presence, setPresence] =
    useState(null);

  const [presenceError, setPresenceError] =
    useState("");

  const loadPresence = async () => {
    if (!user?.id) {
      setPresence(null);
      return;
    }

    try {
      setPresenceError("");

      const data =
        await getPresence(
          user.id,
          workspace?.id
        );

      setPresence(data);
    } catch (error) {
      setPresenceError(
        error.message
      );
    }
  };

  useEffect(() => {
    loadPresence();
  }, [
    user?.id,
    workspace?.id,
  ]);

  const setStatus = async (
    status
  ) => {
    if (!user?.id) {
      return null;
    }

    const data =
      await updatePresence(
        user.id,
        status
      );

    setPresence(data);

    return data;
  };

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    setStatus("online").catch(
      () => {}
    );

    const handleUnload = () => {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        return;
      }

      fetch(
        `${API_URL}/api/presence/${user.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "offline",
          }),
          keepalive: true,
        }
      ).catch(() => {});
    };

    window.addEventListener(
      "beforeunload",
      handleUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleUnload
      );
    };
  }, [user?.id]);

  return (
    <PresenceContext.Provider
      value={{
        presence,
        status:
          presence?.status ||
          "offline",
        setStatus,
        loadPresence,
        presenceError,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
};

export {
  PresenceContext,
  PresenceProvider,
};