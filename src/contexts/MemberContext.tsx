{/*import { createContext, useContext, useState } from "react";

const MemberContext = createContext();

export const MemberProvider = ({ children }) => {
  const [member, setMember] = useState(null);

  return (
    <MemberContext.Provider value={{ member, setMember }}>
      {children}
    </MemberContext.Provider>
  );
};

export const useMember = () => useContext(MemberContext);*/}
// context/MemberContext.tsx
import React, { createContext, useContext, useState } from "react";

export interface MemberType {
  name: string;
  email: string;
  plan: "Free" | "Premium" | "Admin";
}

export interface MemberContextType {
  member: MemberType | null;
  setMember: React.Dispatch<React.SetStateAction<MemberType | null>>;
  isPremium: boolean;
  isAdmin: boolean;
}

export const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember] = useState<MemberType | null>(null);

  const isPremium = member?.plan === "Premium";
  const isAdmin = member?.plan === "Admin";

  return (
    <MemberContext.Provider value={{ member, setMember, isPremium, isAdmin }}>
      {children}
    </MemberContext.Provider>
  );
};

export const useMember = (): MemberContextType => {
  const context = useContext(MemberContext);
  if (!context) throw new Error("useMember must be used within a MemberProvider");
  return context;
};

