"use client";

import { useCallback, useEffect, useState } from "react";

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
		<div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
			{/* Breadcrumb */}
			<div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-1 min-h-[36px] overflow-x-auto">
				<button
					type="button"
					onClick={() => browse("/")}
					className="text-xs text-blue-600 hover:text-blue-800 font-mono shrink-0 cursor-pointer"
				>
					/
				</button>
				{pathParts.map((part, i) => {
					const fullPath = "/" + pathParts.slice(0, i + 1).join("/");
					const isLast = i === pathParts.length - 1;
					return (
						<span key={fullPath} className="flex items-center gap-1 shrink-0">
							<span className="text-gray-300 text-xs">/</span>
							{isLast ? (
								<span className="text-xs font-mono font-medium text-gray-900">{part}</span>
							) : (
								<button
									type="button"
									onClick={() => browse(fullPath)}
									className="text-xs text-blue-600 hover:text-blue-800 font-mono cursor-pointer"
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
					<div className="px-3 py-4 text-sm text-gray-400 text-center">Loading...</div>
				) : error ? (
					<div className="px-3 py-4 text-sm text-red-500 text-center">{error}</div>
				) : (
					<>
						{currentPath !== "/" && (
							<button
								type="button"
								onClick={goUp}
								className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-gray-500 cursor-pointer"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								..
							</button>
						)}
						{folders.length === 0 ? (
							<div className="px-3 py-4 text-sm text-gray-400 text-center">No subfolders</div>
						) : (
							folders.map((f) => (
								<button
									key={f.path}
									type="button"
									onClick={() => browse(f.path)}
									className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
								>
									<svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
									</svg>
									<span className="text-gray-900 truncate">{f.name}</span>
								</button>
							))
						)}
					</>
				)}
			</div>

			{/* Actions */}
			<div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
				<span className="text-xs text-gray-400 font-mono truncate mr-2" title={currentPath}>
					{currentPath}
				</span>
				<div className="flex gap-2 shrink-0">
					<button
						type="button"
						onClick={onCancel}
						className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => onSelect(currentPath)}
						className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
					>
						Select this folder
					</button>
				</div>
			</div>
		</div>
	);
}
