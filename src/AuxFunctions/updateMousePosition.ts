import type i_coordinatesPixel from "@/interfaces/i_coordinatesPixel";

export default function updateMousePos(p_e: MouseEvent, p_gridRef: HTMLElement | null, p_mousePos: i_coordinatesPixel, p_zoom: number)  
{
    if (!p_gridRef) return;
    const rect = p_gridRef.getBoundingClientRect();
    
    
    p_mousePos.i_xCord = (p_e.clientX - rect.left) / p_zoom;
    p_mousePos.i_xCord = (p_e.clientY - rect.top) / p_zoom;
    
};