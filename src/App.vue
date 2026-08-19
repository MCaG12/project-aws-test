<script setup lang="ts">
import { onMounted, ref } from 'vue';


  interface i_canvasPixel 
  {
    i_xPos : number;
    i_yPos : number;
    s_pixelColor : string;
  }

  const selectedPixelColor = ref<string>('');
  const pixelArray = ref<i_canvasPixel[]>([]);
  const rowSize = 32; // to quickly get the page up we will assume the grid will be a 32/32 square leading to 1024 pixels

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

  function paintPixel(pixel : i_canvasPixel)
  {
    pixel.s_pixelColor = '#FF0000'
  }

  onMounted(() => { LoadPixelArray() });


</script>

<template>
  <div>
      <input type="color" v-model="selectedPixelColor"/>
  </div>
  <h1>You did it! test</h1>
  <div class="square-grid">
    <div 
      v-for="(pixel, index) in pixelArray" 
      :key="(pixel.i_xPos * rowSize) + pixel.i_yPos || index"
      class="pixel" 
      :style="{ backgroundColor: pixel.s_pixelColor }" 
      @mouseenter="paintPixel(pixel)"
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
</style>
