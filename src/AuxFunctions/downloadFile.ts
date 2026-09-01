export default async function downloadFile() {
    const response = await fetch("http://localhost:3000/get-canvas-ppm");

    if (!response.ok) {
        throw new Error("Download failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "pixel-canvas.ppm";
    link.click();

    URL.revokeObjectURL(url);
}