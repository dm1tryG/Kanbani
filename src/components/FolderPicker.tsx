"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui";

interface FolderEntry {
	name: string;
	path: string;
}

interface FolderPickerProps {
	onSelect: (path: string) => void;
	onCancel: () => void;
}

export default function FolderPicker({ onSelect, onCancel }: FolderPickerProps) {
	const [currentPath, setCurrentPath] = useState("");
	const [folders, setFolders] = useState<FolderEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const browse = useCallback(async (path?: string) => {
		setLoading(true);
		setError("");
		try {
			const url = path ? `/api/browse?path=${encodeURIComponent(path)}` : "/api/browse";
			const res = await fetch(url);
			const data = await res.json();
			if (data.error) {
				setError(data.error);
			} else {
				setCurrentPath(data.current);
				setFolders(data.folders);
			}
		} catch {
			setError("Failed to browse");
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		browse();
	}, [browse]);

	function goUp() {
		const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
		browse(parent);
	}

	const pathParts = currentPath.split("/").filter(Boolean);

	return (
		<div className="border border-border rounded-md overflow-hidden bg-surface">
			{/* Breadcrumb */}
			<div className="px-3 py-2 bg-surface-secondary border-b border-border flex items-center gap-1 min-h-[36px] overflow-x-auto">
				<button
					type="button"
					onClick={() => browse("/")}
					className="text-caption text-primary hover:text-primary-hover font-mono shrink-0 cursor-pointer"
				>
					/
				</button>
				{pathParts.map((part, i) => {
					const fullPath = `/${pathParts.slice(0, i + 1).join("/")}`;
					const isLast = i === pathParts.length - 1;
					return (
						<span key={fullPath} className="flex items-center gap-1 shrink-0">
							<span className="text-text-disabled text-caption">/</span>
							{isLast ? (
								<span className="text-caption font-mono font-medium text-text-primary">{part}</span>
							) : (
								<button
									type="button"
									onClick={() => browse(fullPath)}
									className="text-caption text-primary hover:text-primary-hover font-mono cursor-pointer"
								>
									{part}
								</button>
							)}
						</span>
					);
				})}
			</div>

			{/* Folder list */}
			<div className="max-h-[240px] overflow-y-auto">
				{loading ? (
					<div className="px-3 py-4 text-body text-text-disabled text-center">Loading...</div>
				) : error ? (
					<div className="px-3 py-4 text-body text-destructive text-center">{error}</div>
				) : (
					<>
						{currentPath !== "/" && (
							<button
								type="button"
								onClick={goUp}
								className="w-full px-3 py-2 text-body text-left hover:bg-surface-secondary flex items-center gap-2 text-text-secondary cursor-pointer"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
								..
							</button>
						)}
						{folders.length === 0 ? (
							<div className="px-3 py-4 text-body text-text-disabled text-center">
								No subfolders
							</div>
						) : (
							folders.map((f) => (
								<button
									key={f.path}
									type="button"
									onClick={() => browse(f.path)}
									className="w-full px-3 py-2 text-body text-left hover:bg-primary-light flex items-center gap-2 cursor-pointer"
								>
									<svg
										className="w-4 h-4 text-primary shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
										/>
									</svg>
									<span className="text-text-primary truncate">{f.name}</span>
								</button>
							))
						)}
					</>
				)}
			</div>

			{/* Actions */}
			<div className="px-3 py-2 bg-surface-secondary border-t border-border flex items-center justify-between">
				<span
					className="text-caption text-text-disabled font-mono truncate mr-2"
					title={currentPath}
				>
					{currentPath}
				</span>
				<div className="flex gap-2 shrink-0">
					<Button variant="secondary" size="sm" onClick={onCancel}>
						Cancel
					</Button>
					<Button size="sm" onClick={() => onSelect(currentPath)}>
						Select this folder
					</Button>
				</div>
			</div>
		</div>
	);
}
