import { Url } from "@/const/url";
import type i_canvasPixel from "@/interfaces/i_canvasPixel";
import {  ref } from 'vue';

export default 
async function GetCanvasState() 
{
    const url = Url.backendUrl + '/initalize-canvas';
    let pixelArray = [];

    try 
    {
        const response = await fetch(url);
        
        const data = await response.json();

        pixelArray = data.currentCanvas;
        return pixelArray;
    } 
    
    catch (error) 
    {
        console.error('Fetch error:', error);
    }
}
