import type { ButtonHTMLAttributes } from "react";

const variants = {
	primary:
		"bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:bg-border-strong disabled:cursor-not-allowed",
	secondary: "text-text-secondary hover:text-text-primary",
	destructive: "text-destructive hover:text-destructive-hover",
	ghost: "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary",
	success: "bg-success text-white hover:bg-success-hover",
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
			className={`font-medium rounded-md transition-colors cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
