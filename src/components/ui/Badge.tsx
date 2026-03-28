import type { HTMLAttributes } from "react";

const variants = {
	default: "bg-primary-light text-primary",
	agent: "bg-accent-light text-accent",
	warning: "bg-warning-light text-amber-700 animate-pulse",
	neutral: "bg-surface-tertiary text-text-secondary",
	count: "bg-surface-tertiary text-text-disabled",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	variant?: keyof typeof variants;
};

export default function Badge({
	variant = "default",
	className = "",
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={`inline-block text-caption font-medium px-1.5 py-0.5 rounded-sm ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</span>
	);
}
