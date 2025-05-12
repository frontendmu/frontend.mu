<script setup lang="ts">
import speakersResponse from '../../frontendmu-data/data/speakers-raw.json'
import Contributors from '../../frontendmu-data/data/contributors.json'
import { communityMembers, organisers } from '../../frontendmu-data/data/people'
import { getGithubUrl } from '@/utils/helpers'

interface Contributor {
  username: string
  contributions: number
}

const contributors: Contributor[] = Contributors
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <ContentBlock>
    <div class="space-y-8 sm:space-y-12">
      <div class="space-y-5 sm:mx-auto sm:space-y-4">
        <BaseHeading>Organisers</BaseHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          There are many people who contribute to making front-end coders an
          active community. This is a growing list of people who help either with
          meetup organisation, our website, or simply being active in the
          community
        </p>
      </div>

      <ul id="team" role="list" class="mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:gap-x-8">
        <li v-for="person in organisers" :key="person.id">
          <component :is="person.id ? NuxtLink : 'div'" :href="person.id ? `/speaker/${person.id}` : null">
            <span v-if="person.id" class="sr-only">{{ person.name }}</span>

            <img
              class="mx-auto h-20 w-20 rounded-lg border-verse-200 dark:border-verse-600 shadow-lg border p-2 lg:w-48 lg:h-48"
              :src="person.imageUrl" :alt="person.name" :title="person.name" width="300" height="300"
            >

            <div class="space-y-2 py-2">
              <div class="text-xs font-medium lg:text-lg text-center">
                <h3 class="text-verse-500 dark:text-verse-200">
                  {{ person.name }}
                </h3>
                <p class="font-heading uppercase font-bold text-xs dark:text-verse-400 text-verse-500 saturate-50">
                  {{ person.role }}
                </p>
              </div>
            </div>
          </component>
        </li>
      </ul>

      <div class="space-y-5 sm:mx-auto sm:space-y-4">
        <BaseHeading>Community Members</BaseHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          People who have been active in the community
        </p>
      </div>

      <ul id="team" role="list" class="mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-5 md:gap-x-6 lg:gap-x-8">
        <li v-for="person in communityMembers" :key="person.id">
          <div>
            <img
              class="mx-auto h-20 w-20 rounded-lg border-verse-200 dark:border-verse-600 shadow-lg border p-2 lg:w-48 lg:h-48"
              :src="person.imageUrl" :alt="person.name" :title="person.name" width="300" height="300"
            >
            <div class="space-y-2 py-2">
              <div class="text-xs font-medium lg:text-lg text-center">
                <h3 class="text-verse-500 dark:text-verse-200">
                  {{ person.name }}
                </h3>
                <p class="font-heading uppercase font-bold text-xs dark:text-verse-400 text-verse-500 saturate-50">
                  {{ person.role }}
                </p>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div class="space-y-5 sm:mx-auto sm:space-y-4">
        <BaseHeading>Speakers</BaseHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          People who shared their knowledge with the community during
          frontend-coders meetups since 2016
        </p>
      </div>

      <ul id="team" role="list" class="mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-5 md:gap-x-6 lg:gap-x-8">
        <li v-for="person in speakersResponse" :key="person.id">
          <NuxtLink :href="`/speaker/${person.id}`" class="space-y-4" :title="person.name">
            <img
              class="mx-auto h-20 w-20 rounded-full border-verse-2 shadow-lg 00 border p-2 lg:w-32 lg:h-32 profile-avatar"
              :src="getGithubUrl(person?.github_account || '')"
              :alt="person.name" :title="person.name" width="300" height="300"
            >

            <div class="space-y-2">
              <div class="text-xs font-medium lg:text-lg text-center">
                <h3 class="text-verse-500 dark:text-verse-200">
                  {{ person.name }}
                </h3>
              </div>
            </div>
          </NuxtLink>
          <a
            v-if="person?.github_account" :href="`https://github.com/${person?.github_account}`" target="_blank"
            class="flex justify-center gap-2 items-center dark:text-verse-400 text-verse-600 hover:text-verse-900 hover:dark:text-verse-100"
          >
            <Icon name="carbon:logo-github" class="w-4 h-4" />
            <p class="font-heading ">
              {{ person?.github_account }}
            </p>
          </a>
        </li>
      </ul>

      <div class="space-y-5 sm:mx-auto sm:space-y-4 pt-16">
        <BaseHeading>Contributors</BaseHeading>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          People who contributed code to our website based on the data directly
          from GitHub.
        </p>
      </div>

      <ul id="team" role="list" class="mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:gap-x-8">
        <li v-for="person in contributors" :key="person.username">
          <a
            :href="`https://github.com/frontendmu/frontend.mu/commits/?author=${person.username}`"
            target="_blank" class="space-y-4"
          >
            <img
              class="mx-auto h-20 w-20 rounded-full border-verse-2 shadow-lg 00 border p-2 lg:w-48 lg:h-48 profile-avatar"
              :src="getGithubUrl(person.username)" :alt="person.username" :title="person.username" width="300"
              height="300"
            >

            <div class="space-y-2">
              <div class="text-xs font-medium lg:text-lg text-center">
                <h3 class="text-verse-500 dark:text-verse-200">
                  {{ person.username }}
                </h3>
                <p class="font-heading text-sm dark:text-verse-400 text-verse-600">
                  {{ person.contributions }} contributions
                </p>
              </div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </ContentBlock>
</template>
