import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	ref?: Ref<HTMLInputElement>;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	label?: string;
	ref?: Ref<HTMLTextAreaElement>;
};

const inputClass =
	"w-full px-3 py-2.5 bg-surface border border-border-strong rounded-md text-body text-foreground placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

export function Input({ label, id, className = "", ref, ...props }: InputProps) {
	return (
		<div>
			{label && (
				<label htmlFor={id} className="block text-body font-semibold text-foreground mb-1.5">
					{label}
				</label>
			)}
			<input ref={ref} id={id} className={`${inputClass} ${className}`} {...props} />
		</div>
	);
}

export function Textarea({ label, id, className = "", ref, ...props }: TextareaProps) {
	return (
		<div>
			{label && (
				<label htmlFor={id} className="block text-body font-semibold text-foreground mb-1.5">
					{label}
				</label>
			)}
			<textarea ref={ref} id={id} className={`${inputClass} resize-none ${className}`} {...props} />
		</div>
	);
}
