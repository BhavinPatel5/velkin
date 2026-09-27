/** Human-readable byte size for file pickers. */
export function formatInputFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function sumFileSizes(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}

export function fileListLabel(files: File[]): string {
  return files.map((file) => file.name).join(", ");
}
