import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DiagnosisRecord {
  id: string;
  user_id: string;
  image_url: string | null;
  diagnosis: string;
  description: string | null;
  risk_level: number | null;
  brightness: number | null;
  sacs_grade: string | null;
  advice: string | null;
  emergency_alert: string | null;
  created_at: string;
}

export interface SaveDiagnosisParams {
  image_url?: string;
  diagnosis: string;
  description?: string;
  risk_level?: number;
  brightness?: number;
  sacs_grade?: string;
  advice?: string;
  emergency_alert?: string;
}

export function useDiagnosisHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!user) {
      setRecords([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("diagnosis_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching diagnosis history:", err);
      setError("기록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveDiagnosis = useCallback(async (params: SaveDiagnosisParams) => {
    if (!user) {
      console.warn("Cannot save diagnosis: User not authenticated");
      return { success: false, error: "로그인이 필요합니다" };
    }

    try {
      const { error } = await supabase
        .from("diagnosis_history")
        .insert({
          user_id: user.id,
          image_url: params.image_url || null,
          diagnosis: params.diagnosis,
          description: params.description || null,
          risk_level: params.risk_level || null,
          brightness: params.brightness || null,
          sacs_grade: params.sacs_grade || null,
          advice: params.advice || null,
          emergency_alert: params.emergency_alert || null,
        });

      if (error) throw error;
      
      // Refresh records after saving
      await fetchRecords();
      return { success: true, error: null };
    } catch (err) {
      console.error("Error saving diagnosis:", err);
      return { success: false, error: "저장에 실패했습니다" };
    }
  }, [user, fetchRecords]);

  const getRecordsByDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return records.filter(record => 
      record.created_at.startsWith(dateStr)
    );
  }, [records]);

  const getRecordsForMonth = useCallback((year: number, month: number) => {
    return records.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate.getFullYear() === year && recordDate.getMonth() === month;
    });
  }, [records]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    error,
    fetchRecords,
    saveDiagnosis,
    getRecordsByDate,
    getRecordsForMonth,
  };
}
