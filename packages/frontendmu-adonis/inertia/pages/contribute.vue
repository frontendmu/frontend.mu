<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Contribute" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 prose dark:prose-invert max-w-none">
        <BaseHeading :level="1" class="mb-6">Contributing to frontend.mu</BaseHeading>

        <p class="lead">
          Thank you for your interest in contributing to Frontend.mu! Our community-driven platform thrives on contributions from members like you, whether you're helping to organize events, enhancing the website, or simply sharing knowledge.
        </p>

        <h2>Code of Conduct</h2>
        <p>
          Please read and follow our <Link href="/code-of-conduct" class="text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200">Code of Conduct</Link> to ensure a welcoming and inclusive environment for everyone.
        </p>

        <h2>Ways to Contribute</h2>
        <p>There are many ways you can contribute to Frontend.mu:</p>
        <ul>
          <li><strong>Event Organization:</strong> Help us plan, promote, and run meetups. You can propose topics, suggest speakers, or volunteer to help with logistics.</li>
          <li><strong>Design and Frontend Development:</strong> Improve the look and feel of our website. Whether it's updating the UI, enhancing accessibility, or fixing bugs, your skills are invaluable.</li>
          <li><strong>Speaker and Sponsor Management:</strong> Assist in managing the list of speakers and sponsors, ensuring that information is up-to-date and accurately represented.</li>
          <li><strong>Community Engagement:</strong> Help us grow the community by spreading the word, engaging with attendees, and fostering discussions online and offline.</li>
        </ul>

        <h2>Running the Project Locally</h2>
        <ol>
          <li><strong>Fork the Repository:</strong> Start by forking the repository to create your own copy on GitHub.</li>
          <li><strong>Clone Your Fork:</strong> Clone your forked repository to your local machine.</li>
          <li><strong>Open the Project:</strong> Navigate to the cloned <code>frontend.mu</code> directory in your code editor.</li>
          <li><strong>Install Dependencies:</strong> Run <code>pnpm install</code> to install the required packages.</li>
          <li><strong>Set Up Environment Variables:</strong> Copy <code>.env.example</code> to <code>.env.development</code>:
            <pre><code>cp .env.example .env.development</code></pre>
          </li>
          <li><strong>Start the Development Server:</strong> Use <code>pnpm run dev</code> to launch the project locally.</li>
        </ol>

        <h2>Submitting Contributions</h2>
        <ol>
          <li><strong>Commit & Push:</strong> Commit your changes and push them to your forked repository.</li>
          <li><strong>Open a Pull Request:</strong> Head to your fork on GitHub, click on the <code>Contribute</code> button, and then <code>Open a pull request</code> to submit your changes.</li>
        </ol>

        <h2>Reporting Issues and Suggestions</h2>
        <p>
          If you encounter any issues or have ideas for improvements, please open an issue on GitHub. Provide as much detail as possible, including screenshots or logs if applicable.
        </p>

        <h2>Code Style and Guidelines</h2>
        <ul>
          <li>Follow our <Link href="/coding-guidelines" class="text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200">coding standards</Link>.</li>
          <li>Ensure your code is well-documented and tested.</li>
          <li>Use clear and concise commit messages.</li>
          <li>Adhere to accessibility best practices.</li>
        </ul>

        <h2>Acknowledgements</h2>
        <p>
          Thank you for being a part of Frontend.mu! Your contributions help us build a stronger community and better resources for frontend developers in Mauritius. If you have any questions, feel free to reach out to us via GitHub issues, Discord or at our next meetup!
        </p>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
