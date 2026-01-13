// triage.ts
// 데이터 기반 문진 엔진 (Data-Driven Triage Engine)

export type RiskLevel = 1 | 2 | 3; // 1: 정상(초록), 2: 주의(노랑), 3: 위험(빨강)
export type AIClass = 1 | 2 | 3;

// ==========================================
// 타입 정의
// ==========================================

export interface QuestionOption {
  text: string;
  next?: string;           // 다음 질문/결과 ID
  dynamic_start?: boolean; // AI 클래스 기반 동적 시작
}

export interface Question {
  id: string;
  type: "question";
  text: string;
  options: QuestionOption[];
  temp_diagnosis?: string;
}

export interface FinalResult {
  type: "result";
  diagnosis: string;
  description: string;
  advice: string;
  risk_level: RiskLevel;
}

// 문진 상태 관리
export interface TriageState {
  currentStepId: string;
  aiClass: AIClass;
  answers: { questionId: string; answerIndex: number }[];
}

export type TriageStep = Question | FinalResult;

// ==========================================
// 질문 데이터베이스 (TRIAGE_DATA)
// ==========================================

export const QUESTIONS: Record<string, Omit<Question, 'id' | 'type'>> = {
  // 응급 질문 (반드시 먼저 거침)
  E_Q1: {
    text: "현재 장루 부위에 심한 통증이 있거나 배가 빵빵하게 부풀어 오르나요?",
    options: [
      { text: "예", next: "E_R1" },
      { text: "아니오", next: "E_Q2" }
    ]
  },
  E_Q2: {
    text: "장루 색깔이 검게 변했거나, 며칠째 가스나 대변이 전혀 나오지 않나요?",
    options: [
      { text: "예", next: "E_R2" },
      { text: "아니오", dynamic_start: true }
    ]
  },

  // 클래스 1 질문 (정상/창백함)
  C1_Q1: {
    text: "장루 주변 피부가 붉게 변하거나 가렵고 따끔거리는 증상이 있나요?",
    options: [
      { text: "예", next: "C1_R2" },
      { text: "아니오", next: "C1_R1" }
    ]
  },
  C1_Q2: {
    text: "장루와 주변 피부 색깔이 어떤가요?",
    options: [
      { text: "장루가 하얗게 변함", next: "C1_Q3" },
      { text: "피부만 하얗게 붊", next: "C1_R3" },
      { text: "선홍색 정상", next: "C1_R1" }
    ]
  },
  C1_Q3: {
    text: "대변이 가늘게 나오거나 통증이 있나요?",
    options: [
      { text: "예", next: "C1_R4" },
      { text: "아니오", next: "C1_R5" }
    ]
  },

  // 클래스 2 질문 (발적/염증)
  C2_Q1: {
    text: "장루의 색깔이 평소보다 창백하거나 보라색에 가깝게 보이나요?",
    options: [
      { text: "예", next: "C2_R1" },
      { text: "아니오", next: "C2_Q2" }
    ]
  },
  C2_Q2: {
    text: "장루와 피부 사이가 벌어져 속살이 보이나요?",
    options: [
      { text: "예", next: "C2_R2" },
      { text: "아니오", next: "C2_Q3" }
    ]
  },
  C2_Q3: {
    text: "붉은 부위 질감/시기가 어떤가요?",
    options: [
      { text: "쭈글쭈글/축축함", next: "C2_R3" },
      { text: "오래된 자국", next: "C2_R4" },
      { text: "최근/따가움", next: "C2_Q4" }
    ]
  },
  C2_Q4: {
    text: "붉은 발진 외 특징이 있나요?",
    options: [
      { text: "하얀 모래알", next: "C2_R5" },
      { text: "은백색 비늘", next: "C2_R6" },
      { text: "붉은 살점", next: "C2_R7" },
      { text: "좁쌀/가려움", next: "C2_R8" },
      { text: "장루판 모양", next: "C2_R9" },
      { text: "두꺼운 피부(사마귀)", next: "C2_R10" },
      { text: "없음", next: "C2_Q5" }
    ]
  },
  C2_Q5: {
    text: "평소 관리 상태가 어떤가요?",
    options: [
      { text: "대변이 자주 샘(자극성)", next: "C2_R11" },
      { text: "뗄 때 아픔(기계적)", next: "C2_R12" },
      { text: "털구멍 뾰루지(모낭염)", next: "C2_R13" },
      { text: "잘 모르겠음", next: "C2_R14" }
    ]
  },

  // 클래스 3 질문 (변색/괴사)
  C3_Q1: {
    text: "변색 부위 특징을 골라주세요.",
    options: [
      { text: "그림자", next: "C3_R1" },
      { text: "닦으면 피 나옴", next: "C3_R2" },
      { text: "변비약 복용", next: "C3_R3" },
      { text: "오래된 흉터", next: "C3_R4" },
      { text: "없음(이상함)", next: "C3_Q2" }
    ]
  },
  C3_Q2: {
    text: "부딪히거나 다친 적 있나요?",
    options: [
      { text: "예", next: "C3_Q3" },
      { text: "아니오", next: "C3_Q4" }
    ]
  },
  C3_Q3: {
    text: "통증과 감각은 어떤가요?",
    options: [
      { text: "욱신거리는 멍", next: "C3_R5" },
      { text: "스치면 극심함", next: "C3_R6" },
      { text: "차가움/감각없음", next: "C3_R7" }
    ]
  },
  C3_Q4: {
    text: "모양과 통증을 설명해주세요.",
    options: [
      { text: "지렁이 혈관", next: "C3_R8" },
      { text: "보라색 테두리+통증", next: "C3_R9" },
      { text: "통증 없음/검게 마름", next: "C3_R10" },
      { text: "해당 없음", next: "C3_R11" }
    ]
  },

  // 공통 마무리 질문
  COMMON_Q1: {
    text: "[마지막] 장루의 모양이나 높이가 평소와 다른가요?",
    options: [
      { text: "길게 튀어나옴(탈출)", next: "COM_R1" },
      { text: "안으로 파고듦(함몰)", next: "COM_R2" },
      { text: "기침 시 솟음(탈장)", next: "COM_R3" },
      { text: "평소와 같음", next: "COM_R4" }
    ]
  }
};

// ==========================================
// 결과 데이터베이스
// ==========================================

export const RESULTS: Record<string, Omit<FinalResult, 'type'>> = {
  // 응급 결과
  E_R1: {
    diagnosis: "응급 상황 (장폐색 의심)",
    risk_level: 3,
    description: "심한 통증과 복부 팽만은 장이 막혔을 가능성을 시사합니다. 이는 혈류 차단으로 이어질 수 있는 위험한 상황입니다.",
    advice: "지금 즉시 응급실을 방문하여 진료를 받으십시오. 음식과 물 섭취를 중단하고 가능한 빨리 의료진의 도움을 받으세요."
  },
  E_R2: {
    diagnosis: "응급 상황 (장루 괴사 의심)",
    risk_level: 3,
    description: "장루 색깔이 검게 변하거나 배출이 멈춘 것은 조직이 죽어가는 '괴사' 상태를 의미할 수 있습니다.",
    advice: "지금 즉시 응급실로 가십시오! 괴사는 빠르게 진행되며, 수술적 처치가 필요할 수 있습니다. 자가 치료로 회복될 수 없습니다."
  },

  // 클래스 1 결과 (정상/창백함)
  C1_R1: {
    diagnosis: "정상 상태",
    risk_level: 1,
    description: "현재 장루 상태가 양호합니다. 장루와 주변 피부 모두 건강한 상태로 보입니다.",
    advice: "주기적인 관리와 관찰을 유지하세요. 하루 1회 장루 상태를 확인하고 기록하는 것을 권장합니다."
  },
  C1_R2: {
    diagnosis: "경미한 피부 자극",
    risk_level: 2,
    description: "장루 주변 피부에 가벼운 자극 증상이 있습니다. 이는 장루판 교체 시 자극이나 배설물 접촉으로 인한 것일 수 있습니다.",
    advice: "피부 보호 필름(Skin Barrier Film)을 사용하고, 장루판 구멍 크기가 장루에 맞는지 확인하세요. 증상이 지속되면 병원을 방문하세요."
  },
  C1_R3: {
    diagnosis: "짓무름",
    risk_level: 2,
    description: "습기로 인해 피부가 하얗게 붓는 '짓무름'이 의심됩니다.",
    advice: "핵심은 '건조'입니다. 드라이기(찬바람)로 말리고 파우더와 보호 필름을 사용하여 뽀송하게 만드십시오."
  },
  C1_R4: {
    diagnosis: "장루 협착",
    risk_level: 2,
    description: "배설구가 좁아지는 '장루 협착'이 의심됩니다. 대변이 가늘게 나오는 것은 이를 나타내는 증상입니다.",
    advice: "변을 묽게 하기 위해 수분 섭취를 늘리십시오. 구멍을 넓히는 시술이 필요할 수 있으니 병원을 예약하십시오."
  },
  C1_R5: {
    diagnosis: "허혈 의심",
    risk_level: 3,
    description: "혈액 공급 부족으로 인한 '허혈'이 의심됩니다. 장루가 하얗게 변한 것은 혈류 문제를 나타낼 수 있습니다.",
    advice: "자가 치료가 불가능한 상태입니다. 수술 부위 혈관 문제일 수 있습니다. 장루 괴사로 진행될 수 있으니 지금 즉시 병원(응급실)에 연락하세요."
  },

  // 클래스 2 결과 (발적/염증)
  C2_R1: {
    diagnosis: "허혈 의심",
    risk_level: 3,
    description: "혈액 공급 부족으로 인한 '허혈'이 의심됩니다. 창백하거나 보라색으로 변한 것은 심각한 혈류 문제를 나타냅니다.",
    advice: "자가 치료가 불가능한 상태입니다. 장루 괴사로 진행될 수 있으니 지금 즉시 병원(응급실)에 연락하세요."
  },
  C2_R2: {
    diagnosis: "점막피부 분리",
    risk_level: 2,
    description: "장루와 피부 사이가 벌어진 상태입니다. 이 틈새로 배설물이 들어가면 감염 위험이 있습니다.",
    advice: "틈새를 장루 파우더나 연고로 메워서 평평하게 만든 후 장루판을 붙이십시오. 증상이 심하면 병원을 방문하세요."
  },
  C2_R3: {
    diagnosis: "짓무름",
    risk_level: 2,
    description: "습기로 인해 피부가 하얗게 붓고 쭈글쭈글해진 '짓무름'이 의심됩니다.",
    advice: "핵심은 '건조'입니다. 드라이기(찬바람)로 말리고 파우더와 보호 필름을 사용하여 뽀송하게 만드십시오."
  },
  C2_R4: {
    diagnosis: "흉터/색소침착",
    risk_level: 1,
    description: "수술이나 과거 상처로 인한 색소침착입니다. 현재 문제가 없는 상태입니다.",
    advice: "평소대로 관리하십시오. 특별한 치료가 필요하지 않습니다."
  },
  C2_R5: {
    diagnosis: "요산 결정",
    risk_level: 2,
    description: "소변 성분이 굳은 '요산 결정'이 의심됩니다. 하얀 모래알 같은 것이 이를 나타냅니다.",
    advice: "식초와 물을 1:1로 섞어 거즈에 적셔 10분간 올려두면 녹습니다. 이후 물로 씻어내세요."
  },
  C2_R6: {
    diagnosis: "건선",
    risk_level: 2,
    description: "자가면역 질환인 '장루 주위 건선'이 의심됩니다. 은백색 비늘이 특징입니다.",
    advice: "전문적인 치료가 필요하므로 병원을 방문하십시오."
  },
  C2_R7: {
    diagnosis: "육아종",
    risk_level: 2,
    description: "붉은 살점이 덧자란 '육아종'이 의심됩니다. 출혈이 잦을 수 있습니다.",
    advice: "문지르지 마시고 피부를 말려주세요. 심하면 병원에서 제거해야 합니다."
  },
  C2_R8: {
    diagnosis: "모낭염",
    risk_level: 2,
    description: "털구멍 세균 감염인 '모낭염'이 의심됩니다. 좁쌀 같은 뾰루지와 가려움이 특징입니다.",
    advice: "항생제 연고나 파우더를 사용하십시오. 면도 시 가위나 전기 클리퍼를 사용하여 자극을 줄이십시오."
  },
  C2_R9: {
    diagnosis: "알레르기",
    risk_level: 2,
    description: "제품 성분에 반응하는 '알레르기 피부염'이 의심됩니다. 장루판 모양대로 발진이 생긴 것이 특징입니다.",
    advice: "사용 중인 장루판 브랜드를 변경하십시오. 심하면 스테로이드 로션 처방이 필요합니다."
  },
  C2_R10: {
    diagnosis: "기성 사마귀 병변",
    risk_level: 2,
    description: "만성 자극으로 피부가 두꺼워진 '기성 사마귀 병변'이 의심됩니다.",
    advice: "지속적인 배설물 노출이 원인입니다. 장루판 구멍을 장루 크기에 딱 맞게 줄이십시오."
  },
  C2_R11: {
    diagnosis: "자극성 피부염",
    risk_level: 2,
    description: "배설물 누수로 인해 피부가 붉어진 상태입니다.",
    advice: "[관리법] 깨끗이 씻고 말린 후, '피부 보호 필름(Skin Barrier Film)'을 발라주세요. 구멍 크기를 장루에 맞게 줄이십시오."
  },
  C2_R12: {
    diagnosis: "기계적 손상",
    risk_level: 2,
    description: "장루판 제거 시 자극으로 피부가 손상된 상태입니다.",
    advice: "[관리법] 장루판 제거 시 반드시 '제거제(Remover)'를 사용하여 부드럽게 떼어내십시오. 보호 필름을 사용하십시오."
  },
  C2_R13: {
    diagnosis: "모낭염",
    risk_level: 2,
    description: "털구멍 세균 감염인 '모낭염'이 의심됩니다.",
    advice: "항생제 연고나 파우더를 사용하십시오. 면도 시 가위나 전기 클리퍼를 사용하여 자극을 줄이십시오."
  },
  C2_R14: {
    diagnosis: "상세 불명의 발적",
    risk_level: 2,
    description: "원인을 알 수 없는 붉은 발진이 지속됩니다.",
    advice: "정확한 진단과 치료를 위해 가까운 병원(장루 간호사)을 방문하십시오."
  },

  // 클래스 3 결과 (변색/괴사)
  C3_R1: {
    diagnosis: "정상 (그림자)",
    risk_level: 1,
    description: "변색으로 보인 부분은 조명에 의한 그림자였습니다. 장루 상태가 양호합니다.",
    advice: "주기적인 관리와 관찰을 유지하세요."
  },
  C3_R2: {
    diagnosis: "출혈 부위",
    risk_level: 2,
    description: "닦으면 피가 나는 부위가 있습니다. 표면의 작은 상처일 수 있습니다.",
    advice: "깨끗한 거즈로 가볍게 압박하세요. 출혈이 멈추지 않으면 병원을 방문하십시오."
  },
  C3_R3: {
    diagnosis: "대장흑색증",
    risk_level: 1,
    description: "변비약 복용으로 인한 '대장흑색증'이 의심됩니다.",
    advice: "단순 색소 침착으로 건강에 해롭지 않습니다. 특별한 치료가 필요 없습니다."
  },
  C3_R4: {
    diagnosis: "흉터/색소침착",
    risk_level: 1,
    description: "과거 상처의 흔적(흉터)입니다.",
    advice: "장루와 피부가 건강합니다. 주기적으로 관리해주세요."
  },
  C3_R5: {
    diagnosis: "단순 타박상",
    risk_level: 1,
    description: "외부 충격에 의한 '단순 타박상'으로 보입니다. 욱신거리는 통증이 있습니다.",
    advice: "특별한 치료 없이 자연 치유됩니다. 장루판 교체 시 부드럽게 다뤄주세요."
  },
  C3_R6: {
    diagnosis: "괴저성 농피증",
    risk_level: 3,
    description: "자가면역 질환인 '괴저성 농피증'이 강력히 의심됩니다. 스치면 극심한 통증이 특징입니다.",
    advice: "절대 상처를 뜯거나 소독약으로 세게 닦지 마십시오. 일반 치료로 낫지 않으므로 통증이 심하고 위험한 질환입니다. 즉시 병원으로 가십시오."
  },
  C3_R7: {
    diagnosis: "급성 괴사",
    risk_level: 3,
    description: "조직이 죽어가는 '장루 괴사'가 의심됩니다. 차갑고 감각이 없는 것은 심각한 상태를 나타냅니다.",
    advice: "자가 관리로 회복될 수 없습니다. 괴사 부위를 제거하는 수술적 처치가 필요할 수 있습니다. 장루 전체가 썩어 들어갈 위험이 있습니다. 지금 즉시 응급실로 가십시오!"
  },
  C3_R8: {
    diagnosis: "장루 정맥류",
    risk_level: 3,
    description: "혈관이 확장된 '장루 정맥류'가 의심됩니다. 지렁이 같은 혈관이 보이는 것이 특징입니다.",
    advice: "절대 문지르지 마십시오. 작은 자극에도 대량 출혈이 발생할 수 있습니다. 출혈이 시작되어 멈추지 않으면 즉시 응급실로 가야 합니다."
  },
  C3_R9: {
    diagnosis: "허혈 진행",
    risk_level: 3,
    description: "보라색 테두리와 통증은 혈류 차단으로 인한 허혈이 진행 중임을 나타냅니다.",
    advice: "장루 괴사로 진행될 수 있으니 지금 즉시 병원(응급실)에 연락하세요."
  },
  C3_R10: {
    diagnosis: "괴사",
    risk_level: 3,
    description: "조직이 죽어가는 '장루 괴사'가 의심됩니다. 통증이 없고 검게 마르는 것은 심각한 상태입니다.",
    advice: "자가 관리로 회복될 수 없습니다. 지금 즉시 응급실로 가십시오!"
  },
  C3_R11: {
    diagnosis: "상세 불명의 변색",
    risk_level: 2,
    description: "원인을 특정하기 어려운 변색입니다. 추가 검사가 필요합니다.",
    advice: "정확한 진단을 위해 가까운 병원을 방문하십시오. 사진을 보여주시면 도움이 됩니다."
  },

  // 공통 결과
  COM_R1: {
    diagnosis: "장루 탈출",
    risk_level: 2,
    description: "장루가 평소보다 길게 튀어나온 '장루 탈출'이 의심됩니다.",
    advice: "누워서 휴식을 취하면 들어갈 수 있습니다. 복압이 오르는 운동을 피하고 넉넉한 주머니를 사용하세요. 색이 검게 변하거나 통증이 심하면 즉시 응급실로 가십시오."
  },
  COM_R2: {
    diagnosis: "장루 함몰",
    risk_level: 2,
    description: "피부 안쪽으로 들어간 '함몰 장루'가 의심됩니다.",
    advice: "배설물이 새기 쉬워 피부 손상이 유발됩니다. 함몰형 볼록판을 사용하면 도움이 됩니다."
  },
  COM_R3: {
    diagnosis: "장루 탈장",
    risk_level: 2,
    description: "장루 주변이 불룩하게 솟은 '장루 탈장'이 의심됩니다.",
    advice: "활동 시 '장루용 복대'를 착용하여 복부를 지지하십시오. 체중 조절과 변비 예방이 중요합니다. 갑작스러운 극심한 복통이나 구토가 동반되면 '장 감돈'일 수 있습니다. 즉시 응급실로 가십시오."
  },
  COM_R4: {
    diagnosis: "정상 상태",
    risk_level: 1,
    description: "장루와 피부가 건강합니다. 모양과 높이도 정상입니다.",
    advice: "현재 상태가 아주 좋습니다. 주기적으로 관리해주세요!"
  }
};

// ==========================================
// AI 클래스별 시작 질문 ID
// ==========================================

const CLASS_START_QUESTIONS: Record<AIClass, string> = {
  1: "C1_Q1", // 정상/창백함
  2: "C2_Q1", // 발적/염증
  3: "C3_Q1"  // 변색/괴사
};

// ==========================================
// 문진 엔진 함수
// ==========================================

/**
 * 질문 객체 가져오기
 */
export function getQuestion(questionId: string): Question | null {
  const questionData = QUESTIONS[questionId];
  if (!questionData) return null;
  
  return {
    id: questionId,
    type: "question",
    ...questionData
  };
}

/**
 * 결과 객체 가져오기
 */
export function getResult(resultId: string): FinalResult | null {
  const resultData = RESULTS[resultId];
  if (!resultData) return null;
  
  return {
    type: "result",
    ...resultData
  };
}

/**
 * 응급 문진 시작
 */
export function startEmergencyQuestionnaire(): Question {
  return getQuestion("E_Q1")!;
}

/**
 * 다음 단계 가져오기
 * @param currentStepId 현재 질문 ID
 * @param answerIndex 선택한 답변 인덱스
 * @param aiClass AI 분류 클래스
 * @returns 다음 질문 또는 최종 결과
 */
export function getNextStep(
  currentStepId: string,
  answerIndex: number,
  aiClass: AIClass
): TriageStep {
  // 현재 질문 가져오기
  const currentQuestion = QUESTIONS[currentStepId];
  if (!currentQuestion) {
    // 예외: 알 수 없는 질문 ID
    return getResult("C1_R1")!; // 기본값: 정상 상태
  }

  // 선택한 옵션 가져오기
  const selectedOption = currentQuestion.options[answerIndex];
  if (!selectedOption) {
    // 예외: 유효하지 않은 답변 인덱스
    return getResult("C1_R1")!;
  }

  // dynamic_start가 true면 AI 클래스에 맞는 질문으로 이동
  if (selectedOption.dynamic_start) {
    const classStartId = CLASS_START_QUESTIONS[aiClass];
    const nextQuestion = getQuestion(classStartId);
    if (nextQuestion) {
      return nextQuestion;
    }
  }

  // next가 있으면 해당 ID로 이동
  if (selectedOption.next) {
    const nextId = selectedOption.next;
    
    // 결과인지 확인 (R로 끝나는 ID)
    if (RESULTS[nextId]) {
      return getResult(nextId)!;
    }
    
    // 질문인지 확인
    if (QUESTIONS[nextId]) {
      return getQuestion(nextId)!;
    }
  }

  // 기본값: 정상 상태
  return getResult("C1_R1")!;
}

/**
 * 위험도 문자열 변환
 */
export function getRiskLevelString(level: RiskLevel): "low" | "medium" | "high" {
  switch (level) {
    case 1:
      return "low";
    case 2:
      return "medium";
    case 3:
      return "high";
    default:
      return "low";
  }
}

/**
 * 위험도 숫자를 한글로 변환
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case 1:
      return "정상";
    case 2:
      return "주의";
    case 3:
      return "위험";
    default:
      return "정상";
  }
}
