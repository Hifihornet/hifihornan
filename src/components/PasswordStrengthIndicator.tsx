import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const checks = useMemo(() => {
    return {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const strength = useMemo(() => {
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks <= 1) return { level: 0, label: "Mycket svagt", color: "bg-destructive" };
    if (passedChecks === 2) return { level: 1, label: "Svagt", color: "bg-orange-500" };
    if (passedChecks === 3) return { level: 2, label: "Medel", color: "bg-yellow-500" };
    if (passedChecks === 4) return { level: 3, label: "Starkt", color: "bg-green-500" };
    return { level: 4, label: "Mycket starkt", color: "bg-emerald-500" };
  }, [checks]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= strength.level ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      
      <p className={`text-xs font-medium ${
        strength.level <= 1 ? "text-destructive" : 
        strength.level === 2 ? "text-yellow-600" : 
        "text-green-600"
      }`}>
        {strength.label}
      </p>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <CheckItem passed={checks.length} label="Minst 6 tecken" />
        <CheckItem passed={checks.lowercase} label="Liten bokstav (a-z)" />
        <CheckItem passed={checks.uppercase} label="Stor bokstav (A-Z)" />
        <CheckItem passed={checks.number} label="Siffra (0-9)" />
        <CheckItem passed={checks.special} label="Specialtecken (!@#...)" />
      </div>
    </div>
  );
};

const CheckItem = ({ passed, label }: { passed: boolean; label: string }) => (
  <div className={`flex items-center gap-1 ${passed ? "text-green-600" : "text-muted-foreground"}`}>
    {passed ? (
      <Check className="w-3 h-3" />
    ) : (
      <X className="w-3 h-3" />
    )}
    <span>{label}</span>
  </div>
);

export default PasswordStrengthIndicator;
