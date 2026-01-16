import { Shield } from "lucide-react";

interface AdminBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const AdminBadge = ({ 
  className = "", 
  size = "sm", 
  showLabel = false 
}: AdminBadgeProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  
  const iconSize = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
    lg: "w-5 h-5",
  };

  if (showLabel) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium ring-1 ring-blue-500/20 ${className}`}
        title="Admin"
      >
        <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span>Admin</span>
      </div>
    );
  }

  return (
    <div
      className={`absolute flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md ${sizeClasses[size]} ${className}`}
      title="Admin"
    >
      <Shield className={iconSize[size]} strokeWidth={2.5} />
    </div>
  );
};

export default AdminBadge;
