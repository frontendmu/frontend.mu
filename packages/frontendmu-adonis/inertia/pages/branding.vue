<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Branding" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Brand Assets</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-8">
          Download our logos and brand assets for use in your projects and
          materials.
        </p>

        <div class="space-y-8">
          <!-- Logo Section -->
          <section>
            <h2
              class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-4"
            >
              Logo
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div
                class="p-8 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 flex items-center justify-center"
              >
                <div class="w-24 h-24 text-verse-600 dark:text-verse-300">
                  <svg
                    width="100%"
                    viewBox="0 0 874 875"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M859.531 437.446C859.531 670.711 670.358 859.812 436.996 859.812C203.635 859.812 14.461 670.711 14.461 437.446C14.461 204.182 203.635 15.0801 436.996 15.0801C670.358 15.0801 859.531 204.182 859.531 437.446Z"
                      stroke="currentColor"
                      stroke-width="30"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M366.465 176.049H457.133L344.931 440.435L344.907 440.492L242.953 682.966H152.312L366.465 176.049ZM510.002 230.04L721.787 441.878L339.608 633.855L388.574 517.196L586.487 423.5L475.465 310.902L510.002 230.04Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
              <div
                class="p-8 bg-verse-900 dark:bg-black rounded-xl shadow-sm border border-verse-700 flex items-center justify-center"
              >
                <div class="w-24 h-24 text-white">
                  <svg
                    width="100%"
                    viewBox="0 0 874 875"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M859.531 437.446C859.531 670.711 670.358 859.812 436.996 859.812C203.635 859.812 14.461 670.711 14.461 437.446C14.461 204.182 203.635 15.0801 436.996 15.0801C670.358 15.0801 859.531 204.182 859.531 437.446Z"
                      stroke="currentColor"
                      stroke-width="30"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M366.465 176.049H457.133L344.931 440.435L344.907 440.492L242.953 682.966H152.312L366.465 176.049ZM510.002 230.04L721.787 441.878L339.608 633.855L388.574 517.196L586.487 423.5L475.465 310.902L510.002 230.04Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          <!-- Colors Section -->
          <section>
            <h2
              class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-4"
            >
              Colors
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div class="h-20 bg-verse-500 rounded-lg mb-2" />
                <p class="text-sm text-verse-600 dark:text-verse-400">
                  Primary
                </p>
                <p class="text-xs font-mono text-verse-500">#0ea5e9</p>
              </div>
              <div>
                <div class="h-20 bg-verse-700 rounded-lg mb-2" />
                <p class="text-sm text-verse-600 dark:text-verse-400">Dark</p>
                <p class="text-xs font-mono text-verse-500">#0369a1</p>
              </div>
              <div>
                <div class="h-20 bg-verse-900 rounded-lg mb-2" />
                <p class="text-sm text-verse-600 dark:text-verse-400">
                  Darker
                </p>
                <p class="text-xs font-mono text-verse-500">#0c4a6e</p>
              </div>
              <div>
                <div class="h-20 bg-verse-300 rounded-lg mb-2" />
                <p class="text-sm text-verse-600 dark:text-verse-400">Light</p>
                <p class="text-xs font-mono text-verse-500">#7dd3fc</p>
              </div>
              <div>
                <div class="h-20 bg-verse-100 rounded-lg mb-2" />
                <p class="text-sm text-verse-600 dark:text-verse-400">
                  Lighter
                </p>
                <p class="text-xs font-mono text-verse-500">#e0f2fe</p>
              </div>
            </div>
          </section>

          <!-- Usage Guidelines -->
          <section>
            <h2
              class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-4"
            >
              Usage Guidelines
            </h2>
            <ul
              class="list-disc pl-6 text-verse-700 dark:text-verse-300 space-y-2"
            >
              <li>Use the logo with adequate spacing around it</li>
              <li>Do not stretch or distort the logo</li>
              <li>Use appropriate contrast backgrounds</li>
              <li>
                Contact us if you need specific formats or have questions
              </li>
            </ul>
          </section>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
