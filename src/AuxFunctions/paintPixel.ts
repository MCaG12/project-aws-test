import type i_canvasPixel from "@/interfaces/i_canvasPixel";
const rowSize = 64; // to quickly get the page up we will assume the grid will be a 32/32 square leading to 1024 pixels
const pixelArraySize = rowSize * rowSize;


export default
function PaintPixel(p_Pixel: i_canvasPixel, p_canvasPixel: i_canvasPixel[])
{
    if(p_Pixel.i_xPos != null && p_Pixel.i_yPos != null)
    {
        const index = (p_Pixel.i_yPos * rowSize) + p_Pixel.i_xPos;
        if(index > pixelArraySize && index < 0){
            return;
        }

        p_canvasPixel[index] = p_Pixel;
        
    }
    else
    {
        console.error("pixel coordinates not selected!")
    }

}