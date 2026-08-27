const displayMessageTimeMilliSeconds = 5000; 

export default function DisplayMessage(p_toggleMessage: boolean)
{
    p_toggleMessage = true;
    
    setTimeout(() => {
    p_toggleMessage = false;
    }, displayMessageTimeMilliSeconds)
} 