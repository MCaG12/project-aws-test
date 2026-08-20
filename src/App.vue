<script setup lang="ts">
import { onMounted, ref } from 'vue';

  interface i_coords
  {
    i_xCord: number;
    i_yCord: number; 
  }

  interface i_canvasPixel 
  {
    i_xPos : number;
    i_yPos : number;
    s_pixelColor : string;
  }

  const selectedPixelCoordinates = ref<i_coords>();

  const selectedPixelColor = ref<string>('#ff0000');
  const pixelArray = ref<i_canvasPixel[]>([]);
  const rowSize = 64; // to quickly get the page up we will assume the grid will be a 32/32 square leading to 1024 pixels
  const pixelArraySize = rowSize * rowSize;

  function LoadPixelArray()
  {
      let PixelArray = [];
      for(let y = 0; y < rowSize; y++)
      {
        for(let x = 0; x < rowSize; x++)
        {
            let CurrentPixel: i_canvasPixel = {
              i_xPos: x,
              i_yPos: y,
              s_pixelColor: '#ffffff',
            }
            PixelArray[(y * rowSize) + x] = CurrentPixel;
        }
      }
    
      pixelArray.value = PixelArray;
  } 

  function SelectPixel(p_i_xCoord: number, p_i_yCoord: number)
  {
    let newPixelCordinates :i_coords = {
      i_xCord : p_i_xCoord,
      i_yCord : p_i_yCoord
    }
    selectedPixelCoordinates.value = newPixelCordinates;
  }

  function PaintPixel()
  {
    if(selectedPixelCoordinates.value?.i_xCord != null && selectedPixelCoordinates.value?.i_yCord != null)
    {
      const index = (selectedPixelCoordinates.value.i_yCord * rowSize) + selectedPixelCoordinates.value.i_xCord;
      if(index > pixelArraySize){
        return;
      }
      
      const selectedPixel :i_canvasPixel = pixelArray.value[(selectedPixelCoordinates.value.i_yCord * rowSize) + selectedPixelCoordinates.value.i_xCord];
      
      selectedPixel.s_pixelColor =  selectedPixelColor.value;
    }
    else
    {
      console.error("pixel coordinates not selected!")
    }
    
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
      console.log("cleared canvas")
      pixelArray.value = CleanPixelArray;
  }

  onMounted(() => { LoadPixelArray() });
  onMounted((selectedPixelColor: string) => { console.log("selected pixel color changed " + selectedPixelColor)});

  const zoom = ref(1);
  const containerRef = ref(null);
  const gridRef = ref(null);

  const mousePos = ref({ x: 0, y: 0 });

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 2.0;
  const STEP = 0.15;

  const updateMousePos = (e) => {
    if (!gridRef.value) return;
    const rect = gridRef.value.getBoundingClientRect();
    
    mousePos.value = {
      x: (e.clientX - rect.left) / zoom.value,
      y: (e.clientY - rect.top) / zoom.value
    };
  };

  const handleWheel = (e) => {
    const container = containerRef.value;
    if (!container) return;

    const oldZoom = zoom.value;
    
    let newZoom = e.deltaY < 0 ? oldZoom + STEP : oldZoom - STEP;
    newZoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);

    if (newZoom === oldZoom) return;

    const scrollX = container.scrollLeft;
    const scrollY = container.scrollTop;

    zoom.value = newZoom;

    const zoomFactor = newZoom / oldZoom;
    
    container.scrollLeft = (scrollX + mousePos.value.x * oldZoom) * zoomFactor - mousePos.value.x * newZoom;
    container.scrollTop = (scrollY + mousePos.value.y * oldZoom) * zoomFactor - mousePos.value.y * newZoom;
  };

</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <div class="main-header-bar">
      <div class="selected-color-card">
        <span class="header-title">SELECTED COLOR</span>
        <input type="color" v-model="selectedPixelColor"/>
        <span class="header-title">LAST PICKED COLORS</span>
      </div>

      <!-- /**button for the paint pixel */ -->
      <div :style="{ display: 'flex', flexDirection: 'column', width: '20%', alignItems:'center', justifyContent: 'center'}">

        <div @click="ClearPixelArray()" class="paint-pixel-button"> CLEAR CANVAS </div>
        <div @click="PaintPixel()" class="paint-pixel-button"> paint PIXEL </div>

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
    @wheel.prevent="handleWheel"
  >
    <div 
      ref="gridRef"
      class="square-grid"
      :style="{ zoom: zoom }"
      @mousemove="updateMousePos"
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
  .selected-color-card,
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
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

</style>
