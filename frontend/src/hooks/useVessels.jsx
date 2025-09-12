// src/hooks/useVessels.js
import { useQuery } from "@tanstack/react-query";
import { getAllVessels } from "../services/api";

export const useVessels = () => {
  return useQuery({
    queryKey: ["vessels"],
    queryFn: async () => {
      const { data } = await getAllVessels();
      if (!data.success) throw new Error("Failed to load vessels");
      return [...data.vessels].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};