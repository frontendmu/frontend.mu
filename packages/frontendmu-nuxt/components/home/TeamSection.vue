<script setup lang="ts">
import { people } from '../../../frontendmu-data/data/people'

// function to pick from an array of 100ms to 1000ms
const randomDelay = () => `${Math.floor(Math.random() * 50) * 100}ms`
</script>

<template>
    <div class="min-h-[50vh] bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] grid place-items-center">
        <div class="flex flex-wrap lg:gap-6">
            <template v-for="person in people" :key="person.id">
                <CardsPhotoFrame :image-url="person.imageUrl" :name="person.name" :delay="randomDelay()" />
            </template>
        </div>
    </div>
</template>
