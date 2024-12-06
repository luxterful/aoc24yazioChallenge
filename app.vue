<script setup>
import { ref } from "vue";
const session = ref("");

const data = ref();
const count = ref(0);
const err = ref();
const audio = ref();

async function getData() {
  if (!session) return;

  audio.value.play();
  const url = `/api/data`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Session: session.value,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const dat = (await response.text())
      .split(/\r?\n/)
      .map((row) => row.split(""));

    const matrix = dat.map((d) => d.map((c) => ({ val: c, isFound: false })));

    const findPhrase = "XMAS";

    dat.map((row, y) =>
      row.map((_, x) => {
        if (dat[y][x] === findPhrase[0]) {
          [-1, 0, 1]
            .flatMap((xx) => [-1, 0, 1].map((yy) => ({ xx, yy })))
            .map((direction) => {
              (function next({ x, y }, { xx, yy }, phrase, history = []) {
                history.push({ x, y });
                x = x + xx;
                y = y + yy;

                if (
                  x < 0 ||
                  x > dat[0].length - 1 ||
                  y < 0 ||
                  y > dat.length - 1
                )
                  return;

                if (dat[y][x] === phrase[0]) {
                  if (phrase.substring(1) === "") {
                    [{ x, y }, ...history].map(
                      ({ x, y }) => (matrix[y][x].isFound = true)
                    );
                    return true;
                  }
                  return next(
                    { x, y },
                    { xx, yy },
                    phrase.substring(1),
                    history
                  );
                }
              })({ x, y }, direction, findPhrase.substring(1)) && count.value++;
            });
        }
      })
    );

    data.value = matrix;
  } catch (error) {
    console.error(`Failed to fetch data: ${error}`);
    err.value = error;
  }
}
</script>

<template>
  <div class="">
    <audio
      ref="audio"
      src="/background-music.mp3"
      preload
      loop
      id="audio"
      class="hidden"
    ></audio>
    <div
      v-if="!data"
      class="w-full h-screen flex flex-col items-center justify-center"
    >
      <input
        placeholder="paste your session ID of AoC and hit enter"
        type="password"
        class="border-0 w-full text-center focus:caret-transparent focus:outline-0"
        :class="{ 'border-red-400 border-2': err }"
        v-model="session"
        @keydown.enter="getData"
      />
      <span class="block text-sm text-red-400 pt-2">{{ err }}</span>
    </div>
    <div v-else class=" w-full text-center">
      <div class="inline-flex gap-[2px] flex-col ">
        <div
          v-for="row in data"
          class="flex gap-[2px] text-[10px]"
        >
          <div
            class="size-3 overflow-hidden shrink-0 flex items-center justify-center"
            :class="{
              'text-transparent': !col.isFound,
              'rounded-sm': col.isFound,
              'bg-[#165B33] text-white': col.isFound && col.val === 'X',
              'bg-[#F8B229] text-white': col.isFound && col.val === 'M',
              'bg-[#EA4630] text-white': col.isFound && col.val === 'A',
              'bg-[#BB2528] text-white': col.isFound && col.val === 'S',
            }"
            v-for="col in row"
          >
            {{ col.isFound ? col.val : "." }}
          </div>
        </div>
      </div>
    </div>
    <div
      class="w-screen h-screen bg-cover bg-[url(/background-image.jpg)] fixed top-0 left-0 -z-10"
    />
  </div>
</template>
