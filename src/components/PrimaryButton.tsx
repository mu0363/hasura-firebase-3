import { VFC, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
}

export const PrimaryButton: VFC<Props> = ({ children, onClick }) => {
  return (
    <button
      className="py-2 px-4 text-white bg-gray-600 rounded-md"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
