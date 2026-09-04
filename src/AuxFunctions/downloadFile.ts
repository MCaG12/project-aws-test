import { Url } from "@/const/url";

export default async function downloadFile() {
    const response = await fetch(Url.backendUrl + "/get-canvas-ppm");

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