<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import type i_canvasPixel from './interfaces/i_canvasPixel';
  import GetCanvasState from './AuxFunctions/getCanvasState';
  import PaintPixel from './AuxFunctions/paintPixel';
  import type i_coordinatesPixel from './interfaces/i_coordinatesPixel';
  import UpdatePixel from './AuxFunctions/updatePixel';
  import updateMousePos from './AuxFunctions/updateMousePosition';
  import handleWheel from './AuxFunctions/handleMouseWheelInput';
 
  const displayMessageTimeMilliSeconds = 5000; 
  const maxPickedColorsArraySize = 6;

  const selectedPixelCoordinates = ref<i_coordinatesPixel>({i_xCord : 0, i_yCord: 0});

  const selectedPixelColor = ref<string>('#ffffff');
  const pixelArray = ref<i_canvasPixel[]>([]);
  const rowSize = 64; // to quickly get the page up we will assume the grid will be a 32/32 square leading to 1024 pixels
  const lastUsedColors = ref<string[]>([]);

  const ToggleMessage = ref<boolean>(false)
  const MessageText = ref<string>("");

  function SelectPixel(p_i_xCoord: number, p_i_yCoord: number)
  {
    let newPixelCordinates :i_coordinatesPixel = {
      i_xCord : p_i_xCoord,
      i_yCord : p_i_yCoord
    }
    selectedPixelCoordinates.value = newPixelCordinates;
  }

  function ClearPixelArray()
  {
    let CleanPixelArray = [];
      for(let y = 0; y < rowSize; y++)
      {
        for(let x = 0; x < rowSize; x++)
        {
            let CurrentPixel: i_canvasPixel = {
              i_xPos: x,
              i_yPos: y,
              s_pixelColor: '#ffffff',
            }
            CleanPixelArray[(y * rowSize) + x] = CurrentPixel;
        }
      }
      pixelArray.value = CleanPixelArray;
  }

  function selectColor(p_selectedColor : string)
  { 
    lastUsedColors.value = lastUsedColors.value.filter(color => color != p_selectedColor);
    lastUsedColors.value.unshift(p_selectedColor);
    selectedPixelColor.value = p_selectedColor;
  }

  onMounted(async () => 
  { 
    //initializing client canvas and previously used color array
    pixelArray.value = await GetCanvasState();

    const cachedPreviouslyUsedColors = localStorage.getItem('userPreviouslyUsedColorsCache');
    if (cachedPreviouslyUsedColors) {
      const usersPreviousColors = JSON.parse(cachedPreviouslyUsedColors);
      lastUsedColors.value = usersPreviousColors;

      if (Array.isArray(usersPreviousColors) && usersPreviousColors.length > 0) {
        lastUsedColors.value = usersPreviousColors;
        selectedPixelColor.value = usersPreviousColors[0];
      }
    }
  });

  onMounted(() => { 
    const eventSource = new EventSource('http://localhost:3000/events', { withCredentials: true });
    eventSource.onmessage = async (event: MessageEvent) => {
    console.log(event.data);
    const pixel: i_canvasPixel = JSON.parse(event.data);


    PaintPixel(pixel, pixelArray.value);
   
    }
  });

  watch(selectedPixelColor, (newColor) => {
    const isColorAlreadyUsed = lastUsedColors.value.includes(newColor);

    if (!isColorAlreadyUsed) {
      lastUsedColors.value.unshift(newColor);

      if (lastUsedColors.value.length > maxPickedColorsArraySize) {
        lastUsedColors.value.pop();
      }
    }

    localStorage.setItem('userPreviouslyUsedColorsCache', JSON.stringify(lastUsedColors.value));
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
  <div class="main-header-bar">
      <div class="selected-color-card">
        <span class="header-title">SELECTED COLOR</span>
        <input type="color" v-model="selectedPixelColor"/>
        <span class="header-title">LAST PICKED COLORS</span>
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
      <div :style="{ display: 'flex', flexDirection: 'column', width: '20%', alignItems:'center', justifyContent: 'center'}">

        <div @click="ClearPixelArray()" class="paint-pixel-button"> CLEAR CANVAS </div>
        <div 
          @click="UpdatePixel(selectedPixelCoordinates, selectedPixelColor, pixelArray, ToggleMessage, MessageText)" 
          class="paint-pixel-button"> 
          paint PIXEL 
        </div>

      </div>

      <!-- /** displays the users selected coordinates */ -->
      <div class="coordinate-card">
        <div class="card-header">
          <span class="dot"></span>
          <span class="header-title">SELECTED PIXEL COORDINATES</span>
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
    @wheel.prevent="($event) => {zoom = handleWheel($event, containerRef, STEP, MIN_ZOOM, MAX_ZOOM, zoom, mousePos)}"
  >
    <div v-if='ToggleMessage == true' class="MessageContainer">
        <div class="MessageContainerHeader">MENSAGEM</div>
        <p style="color:black">{{MessageText}}</p>
    </div>

    <div 
      ref="gridRef"
      class="square-grid"
      :style="{ zoom: zoom }"
      @mousemove="($event) => {updateMousePos($event, gridRef, mousePos, zoom)}"
    >
      <div 
        v-for="(pixel, index) in pixelArray" 
        :key="(pixel.i_xPos * rowSize) + pixel.i_yPos || index"
        class="pixel" 
        :style="{ 
          backgroundColor: pixel.i_xPos == selectedPixelCoordinates?.i_xCord && pixel.i_yPos == selectedPixelCoordinates?.i_yCord
            ? '#b3b3b3'
            : pixel.s_pixelColor
        }" 
        @click="SelectPixel(pixel.i_xPos, pixel.i_yPos)"
      ></div>
    </div>


  </div>
</template>

<style scoped>

  .main-header-bar {
    width: 100%;
    min-height: 120px; /* Fixed height so header items fit properly */
    padding: 10px 16px;
    box-sizing: border-box;

    background-color: #ff7a00;
    background-image: url("../public/test-bg.png");
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

  }

  /** Pixel UI Card Base Styling */
  .coordinate-card {
    flex: 1;
    max-width: 320px;
    background: rgba(238, 238, 240, 0.92); 
    border: 3px solid #e0d4cc; 
    font-family: "Press Start 2P", monospace;
    padding: 10px;
    box-sizing: border-box;
  }

  .selected-color-card {
    max-width: 300px;
    background: rgba(238, 238, 240, 0.92); 
    border: 3px solid #e0d4cc; 
    font-family: "Press Start 2P", monospace;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 150px;
    max-height: 150px;
  }

  /* Button & Action Container */
  .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .paint-pixel-button {
    padding: 10px 16px;
    background-color: #fcfcfc;
    color: #1a1a1a;
    border: 3px solid #1a1a1a;
    
    font-family: "Press Start 2P", monospace;
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;

    cursor: pointer;
    transition: transform 0.05s ease, box-shadow 0.05s ease;
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
  }

  .square-grid {
    display: grid;
    grid-template-columns: repeat(64, 50px);
    grid-auto-rows: 50px;
    background-color: #e0e0e0;
    margin: auto;
  }

  .pixel {
    box-sizing: border-box;
    width: 100%;          
    height: 100%;          
    border: 2px solid #535353;
  }

  .pixel:hover {
    cursor: pointer;
    filter: brightness(0.8);
  }

  /**Message popup  */
  .MessageContainer {
    width: 500px;
    height: 100px;
    background-color: rgba(238, 238, 240, 0.92); 
    color: antiquewhite;
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .MessageContainerHeader {
    width: 100%;
    height: 30%;
    padding-top: 20px;
    background-color: #ff7a00;
    font-family: "Press Start 2P", monospace;
    text-align: center;
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
