import { VFC, ReactNode } from "react";

interface Props {
  children: ReactNode;
  color: string;
  onClick?: () => void;
}

export const PrimaryButton: VFC<Props> = ({ children, onClick, color }) => {
  return (
    <button
      className={`py-2 px-4 text-white ${color} rounded-md`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
