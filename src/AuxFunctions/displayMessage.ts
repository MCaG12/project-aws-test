import type { Ref } from "vue";

const displayMessageTimeMilliSeconds = 5000; 

export default function DisplayMessage(p_toggleMessage: Ref<boolean> )
{
    p_toggleMessage.value = true;
    
    setTimeout(() => {
    p_toggleMessage.value = false;
    }, displayMessageTimeMilliSeconds)
} 