<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Coding Guidelines" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 prose dark:prose-invert max-w-none">
        <BaseHeading :level="1" class="mb-6">Coding Guidelines</BaseHeading>
        <p>
          To maintain code quality and consistency across the Frontend.mu project, please adhere to the following guidelines:
          However,These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.
        </p>
        <BaseHeading :level="2" class="mb-4 mt-8">1. General Principles</BaseHeading>
        <ul>
          <li><strong>Clarity and Simplicity:</strong> Write clear and straightforward code. Avoid complex or obscure constructs.</li>
          <li><strong>Consistency:</strong> Follow the existing code patterns and project structure. Consistency is key to maintainability.</li>
        </ul>
        <BaseHeading :level="2" class="mb-4 mt-8">2. Language and Frameworks</BaseHeading>
        <p> PLEASE ADD GUIDELINES</p>
        <BaseHeading :level="2" class="mb-4 mt-8">3. File and Folder Structure</BaseHeading>
        <p> PLEASE ADD GUIDELINES</p>
        <BaseHeading :level="2" class="mb-4 mt-8">4. Code Formatting</BaseHeading>
        <p> PLEASE ADD GUIDELINES</p>
        <BaseHeading :level="2" class="mb-4 mt-8">5. Commit Messages</BaseHeading>
        <ul>
          <li><strong>Format:</strong> Follow the convention: <code>type(scope): description</code>. For example, <code>fix(navbar): resolve alignment issue</code>.</li>
          <li><strong>Types:</strong> Use types like <code>feat</code>, <code>fix</code>, <code>docs</code>, <code>style</code>, <code>refactor</code>, <code>test</code>, and <code>chore</code>.</li>
          <li><strong>Detail:</strong> Provide enough context in the description to explain why the change was made.</li>
        </ul>
        <BaseHeading :level="2" class="mb-4 mt-8">6. Documentation</BaseHeading>
        <p> PLEASE ADD GUIDELINES</p>
        <BaseHeading :level="2" class="mb-4 mt-8">7. Testing</BaseHeading>
        <p> PLEASE ADD GUIDELINES</p>
        <BaseHeading :level="2" class="mb-4 mt-8">8. Accessibility</BaseHeading>
        <ul>
          <li><strong>ARIA:</strong> Use ARIA attributes where necessary to improve accessibility.</li>
          <li><strong>Keyboard Navigation:</strong> Ensure that all interactive elements are keyboard-accessible.</li>
          <li><strong>Contrast and Readability:</strong> Follow WCAG guidelines for contrast and readability.</li>
        </ul>
        <BaseHeading :level="2" class="mb-4 mt-8">9. Pull Requests</BaseHeading>
        <ul>
          <li><strong>Review:</strong> Before submitting a pull request, review your code and ensure it meets these guidelines.</li>
          <li><strong>Testing:</strong> Run all tests and linters. Ensure everything passes.</li>
          <li><strong>Description:</strong> Provide a clear and concise description of what your PR does and why.</li>
        </ul>
        <BaseHeading :level="2" class="mb-4 mt-8">10. Code Reviews</BaseHeading>
        <ul>
          <li><strong>Constructive Feedback:</strong> Provide constructive feedback that is clear and actionable.</li>
          <li><strong>Respect:</strong> Respect the original author's approach but suggest improvements when necessary.</li>
          <li><strong>Responsibility:</strong> Reviewers should feel responsible for the quality and maintainability of the codebase.</li>
        </ul>
        <BaseHeading :level="2" class="mb-4 mt-8">11. Dependencies</BaseHeading>
        <ul>
          <li><strong>Updates:</strong> Keep dependencies up-to-date, especially for security patches.</li>
          <li><strong>Minimalism:</strong> Avoid adding unnecessary dependencies. Justify the need for each new dependency in your PR.</li>
        </ul>
        <p class="mt-8">
          Thank you for contributing to Frontend.mu! Following these guidelines helps us maintain a high standard of quality and consistency.
        </p>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
