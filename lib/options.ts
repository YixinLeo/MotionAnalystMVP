export const relationshipOptions = [
  { value: "lover", label: "恋人" },
  { value: "crush", label: "暧昧对象" },
  { value: "boss", label: "老板" },
  { value: "hr", label: "HR" },
  { value: "colleague", label: "同事" },
  { value: "friend", label: "朋友" },
  { value: "family", label: "家人" },
  { value: "other", label: "其他" }
] as const;

export const genderOptions = [
  { value: "neutral", label: "不指定" },
  { value: "female", label: "女性" },
  { value: "male", label: "男性" }
] as const;

export const mbtiOptions = [
  "",
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP"
] as const;

export const speakingStyles = [
  "冷淡",
  "温柔",
  "毒舌",
  "理性",
  "敷衍",
  "强势",
  "客气",
  "暧昧"
] as const;

export const relationshipStatuses = [
  "亲密",
  "普通",
  "紧张",
  "暧昧",
  "不确定",
  "有利益冲突",
  "刚认识"
] as const;

export function relationshipLabel(value: string) {
  return relationshipOptions.find((item) => item.value === value)?.label ?? value;
}
