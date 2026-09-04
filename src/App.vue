<script setup lang="ts">
  import { onMounted, ref, watch, watchEffect } from 'vue';
  import type i_canvasPixel from './interfaces/i_canvasPixel';
  import GetCanvasState from './AuxFunctions/getCanvasState';
  import PaintPixel from './AuxFunctions/paintPixel';
  import type i_coordinatesPixel from './interfaces/i_coordinatesPixel';
  import {UpdatePixel} from './AuxFunctions/updatePixel';
  import updateMousePos from './AuxFunctions/updateMousePosition';
  import handleWheel from './AuxFunctions/handleMouseWheelInput';
  import downloadFile from './AuxFunctions/downloadFile';
  import { Url } from './const/url';
  import type i_SSEEvent from './interfaces/i_SSEBroadCastEvent';
  import { SSEReqCodes } from './const/SSEBroadcastCodes';
 
  const usersConnected = ref<number>(0);
  const lastSnapShotTime = ref<number>(0);
  
  const maxPickedColorsArraySize = 6;

  const selectedPixelCoordinates = ref<i_coordinatesPixel>({i_xCord : 0, i_yCord: 0});

  const selectedPixelColor = ref<string>('#ffffff');
  const pixelArray = ref<i_canvasPixel[]>([]);
  const rowSize = 128; // to quickly get the page up we will assume the grid will be a 32/32 square leading to 1024 pixels
  const lastUsedColors = ref<string[]>([]);

  const toggleMessage = ref<boolean>(false)
  const messageText = ref<string>("");

  const isDarkModeOn = ref<boolean>(false)

  //header stuff
  const pageBackgroundColor = ref<string>("#FFFFFF");
  const buttonBackGroundColor = ref<string>("#FFFFFF");
  const fontColor = ref<string>("#000000");
  const menuBackGround = ref<string>("#f7efda")
  const headerBackGroundColor = ref<string>("#ff7a00")
  const subMenuBorderColor = ref<string>("#e0d4cc")

  // grid stuff
  const gridBackgroundColor = ref<string>('#FFFFFF') 
  const gridBorderColor = ref<string>('#E0E0E0')     
  const gridHoverColor = ref<string>('#F0F0F8')      
  const gridSelectedColor = ref<string>('#3B82F6')
  
  

  function SelectPixel(p_i_xCoord: number, p_i_yCoord: number)
  {
    let newPixelCordinates :i_coordinatesPixel = {
      i_xCord : p_i_xCoord,
      i_yCord : p_i_yCoord
    }
    selectedPixelCoordinates.value = newPixelCordinates;
  }

  function changePageColorMode()
  {
    if(isDarkModeOn.value)
    {
      pageBackgroundColor.value = "#121212";   
      buttonBackGroundColor.value = "#2D2D3A"; 
      fontColor.value = "#E2E8F0";            
      menuBackGround.value = "#1E1E2A";        
      headerBackGroundColor.value = "#5732A8";  
      subMenuBorderColor.value = "#121212";

      gridBackgroundColor.value = "#0F172A";    
      gridBorderColor.value = "#1E293B";        
      gridHoverColor.value = "#334155";         
      gridSelectedColor.value = "#38BDF8"; 
    }
    else
    {
      pageBackgroundColor.value = "#ffffff"
      buttonBackGroundColor.value = "#ffffff";
      fontColor.value = "#000000"
      menuBackGround.value = "#f7efda"
      headerBackGroundColor.value = "#ff7a00";
      subMenuBorderColor.value = "#e0d4cc";

      gridBackgroundColor.value = "#FFFFFF";
      gridBorderColor.value = "#B0B0B0";         
      gridHoverColor.value = "#E2E8F0";
      gridSelectedColor.value = "#2563EB";        

    }
  }

  function toggleColorMode() {
    isDarkModeOn.value = !isDarkModeOn.value;
    changePageColorMode();
}

  function selectColor(p_selectedColor : string)
  { 
    lastUsedColors.value = lastUsedColors.value.filter(color => color != p_selectedColor);
    lastUsedColors.value.unshift(p_selectedColor);
    selectedPixelColor.value = p_selectedColor;
  }

  function onUpdatePixelClick() {
    UpdatePixel(
        selectedPixelCoordinates.value,
        selectedPixelColor.value,
        pixelArray.value,
        toggleMessage,      
        messageText        
    );
}

  //kinda of a cheesy way to do it but it works
  function pickPixelColor()
  {
    let selectedCurrentPixelColor = pixelArray.value[(selectedPixelCoordinates.value.i_yCord * rowSize) + selectedPixelCoordinates.value.i_xCord]?.s_pixelColor; 
    if(selectedCurrentPixelColor != null)
    {
      selectedPixelColor.value = selectedCurrentPixelColor;
    }
  }

  onMounted(async () => 
  { 
    //initializing client canvas and previously used color array
    pixelArray.value = await GetCanvasState();

    const cacheIsDarkModeOn = localStorage.getItem('isDarkModeOn');
    const cachedPreviouslyUsedColors = localStorage.getItem('userPreviouslyUsedColorsCache');

    if (cachedPreviouslyUsedColors) 
    {
      const usersPreviousColors = JSON.parse(cachedPreviouslyUsedColors);
      lastUsedColors.value = usersPreviousColors;
      if (Array.isArray(usersPreviousColors) && usersPreviousColors.length > 0) 
      {
        lastUsedColors.value = usersPreviousColors;
        selectedPixelColor.value = usersPreviousColors[0];
      }
   

    const initialDarkMode = cacheIsDarkModeOn !== null ? JSON.parse(cacheIsDarkModeOn) : false;
    isDarkModeOn.value = initialDarkMode;

    changePageColorMode();

    const urlLastSnapshot = Url.backendUrl + '/canvas-snapshots/fetch-last-snapshot-update-time';
    const response = await fetch(urlLastSnapshot);
    const data = await response.json();

    lastSnapShotTime.value = data.TimeFound[0].LAST_TIME_SAVED; 
  }});

  onMounted(() => { 
    const eventSource = new EventSource(Url.backendUrl + '/events', { withCredentials: true });
    eventSource.onmessage = async (event: MessageEvent) => {
    const parsedSSEevent = JSON.parse(event.data);
    const SSEEventCode : number = parsedSSEevent.i_SSEBroadcastCode
    switch(SSEEventCode)
    {
      case SSEReqCodes.PAINT_PIXEL_SSE_BROADCAST:
        {
          const pixel: i_canvasPixel = parsedSSEevent.any_SSEBroadcastData;
          PaintPixel(pixel, pixelArray.value);
          break;
        }
      case SSEReqCodes.USER_SSE_BROADCAST:
        {
          usersConnected.value = parsedSSEevent.any_SSEBroadcastData
          break;
        }
      case SSEReqCodes.LAST_SNAP_SHOT_SAVED_SSE_BROADCAST:
        {
          lastSnapShotTime.value = parsedSSEevent.any_SSEBroadcastData
          break;
        }
    }}
  });

  watch(isDarkModeOn, (isDarkModeOn) => {
    localStorage.setItem('isDarkModeOn', JSON.stringify(isDarkModeOn));
  })

  watch(selectedPixelColor, (newColor) => {
    const isColorAlreadyUsed = lastUsedColors.value.includes(newColor);

    if (!isColorAlreadyUsed) {
      lastUsedColors.value.unshift(newColor);

      if (lastUsedColors.value.length > maxPickedColorsArraySize) {
        lastUsedColors.value.pop();
      }
    }
    else
    {
      selectColor(newColor);
    }

    localStorage.setItem('userPreviouslyUsedColorsCache', JSON.stringify(lastUsedColors.value));
  });

  watchEffect(() => {
    document.body.style.backgroundColor = isDarkModeOn.value ? '#0a0a0a' : '#f0f0f0';
  });


  const zoom = ref(1);
  const containerRef = ref(null);
  const gridRef = ref(null);

  const mousePos = ref<i_coordinatesPixel>({ i_xCord: 0, i_yCord: 0 });

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 2.0;
  const STEP = 0.15;

</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <div class="main-header-bar" :style="{ backgroundImage: `url(${isDarkModeOn ? Url.darkModeHeaderUrl : Url.lightModeHeaderUrl})`,
                                         backgroundColor: headerBackGroundColor  }">
      <div class="selected-color-card" :style="{backgroundColor : menuBackGround, borderColor : subMenuBorderColor}">
        <span class="header-title" :style="{color: fontColor}">COR SELECIONADA</span>
        <input type="color" v-model="selectedPixelColor"/>
        <span class="header-title" :style="{color: fontColor}">ULTIMAS CORES UTILIZADAS</span>
        <div style="display: flex; flex-direction: row;">
          <div 
            v-for="color in lastUsedColors" 
            :key="color"
            :style="{ backgroundColor: color}"
            class="previouslyUsedColor"
            v-on:click="selectColor(color)"
          ></div>
        </div>

      </div>

      <!-- /**button for the paint pixel */ -->
      <div :style="{display:'flex', flexDirection:'column', flex:'2 1 300px', alignItems:'center', gap:'30px'}">
        <div class="button-container">
          <div 
            class="paint-pixel-button" 
            :style="{backgroundColor: buttonBackGroundColor, color: fontColor}" 
            @click="toggleColorMode()" > 
            {{isDarkModeOn ? 'MODO ESCURO': 'MODO CLARO'}}
          </div> 

          <div 
            @click="onUpdatePixelClick()" 
            :style="{backgroundColor: buttonBackGroundColor, color: fontColor}"
            class="paint-pixel-button"> 
            PINTAR PIXEL 
          </div>

          <div 
          @click="pickPixelColor()"
          class="paint-pixel-button" 
          :style="{backgroundColor: buttonBackGroundColor, color: fontColor}"> 
            SELECIONAR COR PIXEL
          </div> 

          <div 
          @click="downloadFile()"
          class="paint-pixel-button" 
          :style="{backgroundColor: buttonBackGroundColor, color: fontColor}"> 
            SALVAR IMAGEM CANVAS 
          </div> 
        </div>

        <div :style="{ display: 'flex', flexDirection: 'row', width: '100%', alignItems:'center', justifyContent:'space-between'}">
          <div :style="{display:'flex', flexDirection:'row', flex:'2 1 300px', alignItems:'center',gap:'10px'}">
            <div :style="{ width: '20px', height: '20px', backgroundColor:'#00FF00'}"></div>
            <div class="MessageContainerText" :style="{color: fontColor}">USUARIOS CONECTADOS: {{ usersConnected }}</div>
          </div>

          <div :style="{display:'flex', flexDirection:'column', flex:'2 1 300px', alignItems:'center', gap:'30px'}">
            <div class="MessageContainerText" :style="{color: fontColor}">ULTIMO BACKUP DO CANVAS: {{new Date(lastSnapShotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}}</div>   
          </div>
        </div>
      </div>


      <!-- /** displays the users selected coordinates */ -->
      <div class="coordinate-card" :style="{backgroundColor : menuBackGround, borderColor : subMenuBorderColor}">
        <div class="card-header">
          <span class="dot"></span>
          <span class="header-title" :style="{color: fontColor}">COORDENADAS PIXEL SELECIONADO</span>
        </div>
        
        <div class="card-body">
          <div class="coord-box">
            <span class="coord-label">X</span>
            <span class="coord-value">{{ selectedPixelCoordinates?.i_xCord ?? '0' }}</span>
          </div>
          
          <div class="coord-box">
            <span class="coord-label">Y</span>
            <span class="coord-value">{{ selectedPixelCoordinates?.i_yCord ?? '0' }}</span>
          </div>
        </div>
      </div>
  </div>

  <div 
    ref="containerRef" 
    class="grid-container" 
    :style="{backgroundColor: pageBackgroundColor }"
    @wheel.prevent="($event) => {zoom = handleWheel($event, containerRef, STEP, MIN_ZOOM, MAX_ZOOM, zoom, mousePos)}"
  >
    <div v-if='toggleMessage == true' class="MessageContainer">
        
        <div class="MessageContainerHeader" :style="{backgroundColor: headerBackGroundColor}">MENSAGEM</div>
        <p class="MessageContainerText">{{messageText}}</p>
    </div>


    <div style="display: flex; flex-direction: row;">
    <!-- START OF THE PIXEL GRID -->
    <div 
      ref="gridRef"
      class="square-grid"
      :style="{ 
        zoom: zoom,
        backgroundColor: gridBackgroundColor
      }"
      @mousemove="($event) => {updateMousePos($event, gridRef, mousePos, zoom)}"
    >

      <div 
        v-for="(pixel, index) in pixelArray" 
        :key="(pixel.i_xPos * rowSize) + pixel.i_yPos || index"
        class="pixel" 
        :style="{ 
          backgroundColor: (pixel.i_xPos == selectedPixelCoordinates?.i_xCord && pixel.i_yPos == selectedPixelCoordinates?.i_yCord) 
          ? `color-mix(in srgb, ${pixel.s_pixelColor}, black 50%)` 
          : pixel.s_pixelColor,
          borderColor: gridBorderColor,
          outline: (pixel.i_xPos == selectedPixelCoordinates?.i_xCord && pixel.i_yPos == selectedPixelCoordinates?.i_yCord) 
            ? `2px solid ${gridSelectedColor}` 
            : 'none',
          outlineOffset: '-2px',
          zIndex: (pixel.i_xPos == selectedPixelCoordinates?.i_xCord && pixel.i_yPos == selectedPixelCoordinates?.i_yCord) ? 1 : 0
        }" 
        @click="SelectPixel(pixel.i_xPos, pixel.i_yPos)"
      ></div>
      
    </div>
    <!-- END OF THE PIXEL GRID -->
  </div>

  </div>
</template>

<style scoped>
  *{
    padding: 0px;
    margin: 0px;
  }
  .main-header-bar {
    width: 100%;
    min-height: 120px; /* Fixed height so header items fit properly */
    padding: 10px 16px;
    box-sizing: border-box;

    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    image-rendering: pixelated;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    position: sticky;
    top: 0;
    flex-wrap: wrap;     
    min-height: unset;  
  }

  /** Pixel UI Card Base Styling */
  .coordinate-card {
    flex: 1 1 220px;  
    background: rgba(238, 238, 240, 0.92); 
    border: 3px solid; 
    font-family: "Press Start 2P", monospace;
    padding: 10px;
    box-sizing: border-box;
  }

  .selected-color-card {
    max-width: 100%;
    flex: 1 1 220px;       
    background: rgba(238, 238, 240, 0.92); 
    border: 3px solid ; 
    font-family: "Press Start 2P", monospace;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    max-height: 150px;
  }

  /* Button & Action Container */
  .button-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-direction: row;
  }

  .paint-pixel-button {
  padding: clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 16px);
  color: #1a1a1a;
  border: 3px solid #1a1a1a;
  font-family: "Press Start 2P", monospace;
  font-size: clamp(8px, 1.2vw, 11px);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  flex: 0 1 auto;
}

  .paint-pixel-button:hover {
    background-color: #e9e9e9;
    color: #fcfcfc;
  }

  /* Coordinate Card & Labels */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid #1a1a1a;
  }

  .header-title {
    font-size: 9px;
    letter-spacing: 0.5px;
    color: #222222; 
    text-align: center;
  }

  .card-body {
    display: flex;
    gap: 8px;
  }

  .coord-box {
    flex: 1;
    background: #ffffff;
    border: 2px solid #1a1a1a;
    padding: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .coord-label {
    font-size: 8px;
    color: #555555;
  }

  .coord-value {
    font-size: 14px;
    color: #1a1a1a;
  }

  .grid-container {
    width: 100%;
    height: 80vh;
    overflow: auto;
    display: grid;
    place-items: center;
    padding: 40px;
    box-sizing: border-box;
    height: 80vh;
    padding: 16px;
  }

  .square-grid {
    display: grid;
    grid-template-columns: repeat(128, 50px);
    grid-auto-rows: 50px;
    background-color: #e0e0e0;
    margin: auto;
  }

  .pixel {
    box-sizing: border-box;
    width: auto;          
    height: auto;          
    border-style:solid;
    border-width: 2px;
  }

  .pixel:hover {
    cursor: pointer;
    filter: brightness(0.7);
  }

  /**Message popup  */
  .MessageContainer {
    width: 500px;
    max-width: 90vw;
    min-height: 100px;
    background-color: rgba(238, 238, 240, 0.92);
    color: #222222;
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    text-align: center;
    z-index: 1000;
    border-radius: 6px 6px 0 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  .MessageContainerHeader {
    width: 100%;
    padding: 12px 0;
    background-color: #ff7a00;
    color: #ffffff;
    font-family: "Press Start 2P", monospace;
    text-align: center;
    font-size: 12px;
  }

  .MessageContainerText {
    color: #222222;
    font-family: "Press Start 2P", monospace;
    text-align: center;
    font-size: 12px;
    padding: 12px 16px;
    word-wrap: break-word;
  }

  .previouslyUsedColor
  {
    border: 1px solid #000000; 
    width: 25px; 
    height: 25px;
  }

  .previouslyUsedColor:hover
  {
    cursor: pointer;
    filter: brightness(0.8);
  }

</style>
