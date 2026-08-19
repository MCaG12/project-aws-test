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
  const rowSize = 32; // to quickly get the page up we will assume the grid will be a 32/32 square leading to 1024 pixels
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

  function ClearPixelArray(p_pixelArray : i_canvasPixel[])
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
    
      p_pixelArray = CleanPixelArray;
  }

  onMounted(() => { LoadPixelArray() });
  onMounted((selectedPixelColor: string) => { console.log("selected pixel color changed " + selectedPixelColor)});


</script>

<template>
  <div style="display:flex; width:100%; flex-direction: row; justify-content: space-evenly;">
      <input type="color" v-model="selectedPixelColor"/>
      <div @click="ClearPixelArray(pixelArray)" class="clear-button"> CLEAR CANVAS </div>
      <div @click="PaintPixel()" class="clear-button"> paint PIXEL </div>
      <div >
        <p>selected pixel info</p>
        <p>pixel X coordinate: {{ selectedPixelCoordinates?.i_xCord }}</p>
        <p>pixel Y coordinate: {{ selectedPixelCoordinates?.i_yCord }}</p>
      </div>
  </div>
  <h1>You did it! test</h1>
  <div class="square-grid">
    <div 
      v-for="(pixel, index) in pixelArray" 
      :key="(pixel.i_xPos * rowSize) + pixel.i_yPos || index"
      class="pixel" 
      :style="{  backgroundColor: pixel.i_xPos == selectedPixelCoordinates?.i_xCord && pixel.i_yPos == selectedPixelCoordinates?.i_yCord
                  ? '#b3b3b3': pixel.s_pixelColor}" 

      @click="SelectPixel(pixel.i_xPos, pixel.i_yPos)"
    ></div>
  </div>
</template>

<style scoped>
  .square-grid {
    display: grid;
    grid-template-columns: repeat(32, 50px);
    grid-auto-rows: 50px;

    background-color: #e0e0e0;
    width: 100%;
  }

  .pixel {
    box-sizing: border-box;
    width: 100%;          
    height: 100%;          
    border: 2px solid #535353;
  }

  .pixel:hover {
    cursor: pointer;
    filter: brightness(0.5);
  }

  .clear-button
  {
    width: 100px; 
    height: 20px; 
    background-color: aqua;
  }

  .clear-button:hover
  {
    cursor:pointer;
  }

</style>
