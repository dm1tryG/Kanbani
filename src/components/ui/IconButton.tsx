import type { ButtonHTMLAttributes } from "react";

const variants = {
	ghost: "text-faint hover:text-muted hover:bg-surface-dim",
	success: "text-success hover:bg-success-light hover:text-success-hover",
} as const;

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: keyof typeof variants;
};

export default function IconButton({
	variant = "ghost",
	className = "",
	children,
	...props
}: IconButtonProps) {
	return (
		<button
			className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
