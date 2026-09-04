import type i_coordinatesPixel from "@/interfaces/i_coordinatesPixel";
import DisplayMessage from "./displayMessage";
import PaintPixel from "./paintPixel";
import type i_canvasPixel from "@/interfaces/i_canvasPixel";
import type { Ref } from "vue";
import { Url } from "@/const/url";

export async function UpdatePixel(
    p_selectedCoordinates: i_coordinatesPixel,
    p_selectedColor: string,
    p_pixelArray: i_canvasPixel[],
    p_toggleMessage: Ref<boolean>,
    p_messageText: Ref<string>
) {
try 
{
    const url = Url.backendUrl + '/update-pixel';

    const response = await fetch(url, {
    method: 'POST', // Specify the HTTP method
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(
        {
        "X": p_selectedCoordinates.i_xCord,
        "Y": p_selectedCoordinates.i_yCord,
        "Color": p_selectedColor
        }
    )
    });

    
    if(response.status == 200)
    {
    if(p_selectedCoordinates.i_xCord != null && p_selectedCoordinates.i_yCord != null)
    {
        const pixel :i_canvasPixel = 
        {
            i_xPos: p_selectedCoordinates.i_xCord,
            i_yPos: p_selectedCoordinates.i_yCord,
            s_pixelColor: p_selectedColor,
        }

        PaintPixel(pixel, p_pixelArray);
    }
    }
    else
    {
        const responseJson = await response.json();
        p_messageText.value = responseJson.message;
        DisplayMessage(p_toggleMessage);
    }
} 

catch (error) 
{
    console.error('Error:', error);
}

}