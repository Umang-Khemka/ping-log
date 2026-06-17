"use client";

import { useState, useEffect, useCallback } from "react";

export type PingStatus = "up" | "down" | "pending";

export interface Service {
  _id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastPingedAt: string | null;
  lastStatus: PingStatus;
  lastStatusCode: number | null;
  consecutiveFailures: number;
  createdAt: string;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/services", { credentials: "include" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load services");
        return;
      }

      setServices(data.services);
      setError("");
    } catch {
      setError("Something went wrong loading services");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (
    name: string,
    url: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Failed to add service" };
      }

      setServices((prev) => [data.service, ...prev]);
      return { success: true };
    } catch {
      return { success: false, message: "Something went wrong" };
    }
  };

  const toggleService = async (id: string, isActive: boolean) => {
    // Optimistic update
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isActive } : s))
    );

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
        credentials: "include",
      });

      if (!res.ok) {
        // Revert on failure
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !isActive } : s))
        );
      }
    } catch {
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: !isActive } : s))
      );
    }
  };

  const deleteService = async (id: string): Promise<{ success: boolean; message?: string }> => {
    const previousServices = services;
    setServices((prev) => prev.filter((s) => s._id !== id));

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setServices(previousServices);
        return { success: false, message: data.message || "Failed to delete service" };
      }

      return { success: true };
    } catch {
      setServices(previousServices);
      return { success: false, message: "Something went wrong" };
    }
  };

  return {
    services,
    isLoading,
    error,
    addService,
    toggleService,
    deleteService,
    refetch: fetchServices,
  };
}