import type { ButtonHTMLAttributes } from "react";

const variants = {
	primary:
		"bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:bg-border-strong disabled:cursor-not-allowed shadow-sm hover:shadow-md",
	secondary: "text-muted hover:text-foreground",
	destructive: "text-destructive hover:text-destructive-hover",
	ghost: "text-muted hover:bg-surface-dim hover:text-foreground",
	success: "bg-success text-white hover:bg-success-hover shadow-sm hover:shadow-md",
	accent:
		"bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:bg-border-strong disabled:cursor-not-allowed shadow-sm hover:shadow-md",
} as const;

const sizes = {
	sm: "px-3 py-1.5 text-caption",
	md: "px-4 py-2 text-body",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
};

export default function Button({
	variant = "primary",
	size = "md",
	className = "",
	children,
	...props
}: ButtonProps) {
	return (
		<button
			className={`font-semibold rounded-md transition-all duration-150 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
