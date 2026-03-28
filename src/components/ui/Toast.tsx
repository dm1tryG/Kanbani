"use client";

import { useCallback, useEffect, useState } from "react";

interface ToastState {
	message: string;
	visible: boolean;
}

export function useToast(duration = 2000) {
	const [toast, setToast] = useState<ToastState>({ message: "", visible: false });

	useEffect(() => {
		if (!toast.visible) return;
		const timer = setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
		return () => clearTimeout(timer);
	}, [toast.visible, duration]);

	const showToast = useCallback((message: string) => {
		setToast({ message, visible: true });
	}, []);

	return { toast, showToast };
}

export default function Toast({ message, visible }: ToastState) {
	if (!visible) return null;

	return (
		<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
			<div className="bg-foreground text-surface text-caption font-semibold px-4 py-2 rounded-md shadow-dropdown">
				{message}
			</div>
		</div>
	);
}
