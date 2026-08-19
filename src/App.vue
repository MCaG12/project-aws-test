<script setup lang="ts">
import { ref } from 'vue';


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

  } 



</script>

<template>
  <div>
      <input type="color" v-model="selectedPixelColor"/>
  </div>
  <h1>You did it! test</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
