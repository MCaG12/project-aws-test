import type i_coordinatesPixel from "@/interfaces/i_coordinatesPixel";

export default function handleWheel (
                      p_e: any, p_containerRef: any, 
                      p_c_step: number, p_c_MIN_ZOOM: number, 
                      p_c_MAX_ZOOM: number, p_zoom: number, p_mousePos: i_coordinatesPixel
                      ) : number
{
    const container = p_containerRef;
    if (!container) return p_zoom;

    const oldZoom = p_zoom;

    let newZoom = p_e.deltaY < 0 ? oldZoom + p_c_step : oldZoom - p_c_step;
    newZoom = Math.min(Math.max(newZoom, p_c_MIN_ZOOM), p_c_MAX_ZOOM);

    if (newZoom === oldZoom) return p_zoom;

    const scrollX = container.scrollLeft;
    const scrollY = container.scrollTop;

    p_zoom = newZoom;

    const zoomFactor = newZoom / oldZoom;

    container.scrollLeft = (scrollX + p_mousePos.i_xCord * oldZoom) * zoomFactor - p_mousePos.i_xCord * newZoom;
    container.scrollTop = (scrollY + p_mousePos.i_yCord * oldZoom) * zoomFactor - p_mousePos.i_yCord * newZoom;

    return p_zoom;
};