export const API_BASE_URL = "https://stoma-server.onrender.com";

export interface UploadResponse {
  corrected_image_url: string;
  necrosis_class: string;
  brightness_message?: string;
}

export interface QuestionResponse {
  type: "question" | "result";
  question?: string;
  options?: string[];
  stage?: string;
  diagnosis?: string;
  description?: string;
  risk_level?: "low" | "medium" | "high";
  prescription?: string;
  corrected_image_url?: string;
  brightness_message?: string;
}

export interface DiagnosisRecord {
  id: string;
  created_at: string;
  diagnosis: string;
  description: string;
  risk_level: string;
  prescription: string;
  corrected_image_url: string;
}

export async function uploadImage(imageBlob: Blob, userId: string = "anonymous"): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", imageBlob, "stoma_image.jpg");
  formData.append("user_id", userId); //

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return response.json();
}

export async function startQuestionnaire(
  stage: string,
  aiClass: string,
  selectedIndex?: number,
): Promise<QuestionResponse> {
  const body: Record<string, unknown> = {
    stage,
    ai_class: aiClass,
  };

  if (selectedIndex !== undefined) {
    body.selected_index = selectedIndex;
  }

  const response = await fetch(`${API_BASE_URL}/diagnose/question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to get question");
  }

  return response.json();
}

export async function fetchDiagnosisHistory(): Promise<DiagnosisRecord[]> {
  const response = await fetch(`${API_BASE_URL}/history`);

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return response.json();
}

// 진단 결과 저장 API
export interface SaveDiagnosisRequest {
  user_id?: string;
  diagnosis: string;
  description: string;
  advice: string;
  risk_level: number;
  emergency_alert?: string | null;
  corrected_image_url?: string;
}

export async function saveDiagnosisResult(data: SaveDiagnosisRequest): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/diagnose/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.warn("Failed to save diagnosis to server, but continuing...");
      return { success: false };
    }

    return response.json();
  } catch (error) {
    console.warn("Server save failed, continuing offline:", error);
    return { success: false };
  }
}
