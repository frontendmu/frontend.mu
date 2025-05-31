<script setup lang="ts">
const props = defineProps<{
    imageUrl: string
    name: string
    delay: string
}>()

// const imageUrl = computed(() => `https://github.com/${props.githubUsername}.png`)
const firstName = computed(() => props.name.split(' ')[0])
</script>

<template>
    <div class="relative parent">
        <!-- Trou-->
        <div class="absolute left-[50%] -translate-x-3 top-[-5px]">
            <CardsPhotoTrou />
        </div>

        <!-- ANimate this -->
        <div class="frame" :style="`--delay: ${delay}`">
            <!-- Lacorde -->
            <div class="relative z-10">
                <CardsPhotoLacorde />
            </div>

            <!-- Photo Frame -->
            <div class="bg-white p-2 pb-0 shadow-lg -mt-4">
                <div>
                    <a :href="imageUrl.replace('.png', '')">
                        <img :src="imageUrl" class="h-[120px] aspect-square">
                    </a>
                </div>
                <div>
                    <h2 class="text-center">
                        {{ firstName }}
                    </h2>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    font-family: "Reenie Beanie", cursive;
}

@keyframes swing {
    0% {
        transform: rotateZ(-10deg)
    }

    100% {
        transform: rotateZ(10deg)
    }
}

@keyframes lever {
    0% {
        transform: rotate3d(0, 0, 0, 0deg)
    }

    100% {
        transform: rotate3d(0.5, 0.5, 1, -45deg)
    }
}

.frame {
    --delay: 0ms;
    transition: all 500ms linear;
    transform-origin: center top;
    animation: swing 3s var(--delay) ease-in alternate infinite;
    perspective: 2000px;
    perspective-origin: 500% 200%;
}

.parent:hover .frame {
    animation: lever 1s ease-in-out forwards 1;
}
</style>
