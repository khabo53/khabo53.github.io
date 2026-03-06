// context/MemberContext.tsx or types/member.ts
export interface MemberType {
  name: string;
  email: string;
  tier: "Free" | "Premium" | "Admin";
}

export interface MemberContextType {
  member: MemberType | null;
  setMember: React.Dispatch<React.SetStateAction<MemberType | null>>;
  isPremium: boolean;
  isAdmin: boolean;
}
