interface Project {
  title: string
  icon: string
  project_url: string
  description: string
  author_github_username: string
  categories: string[]
}

export const projects: Project[] = [
  {
    title: 'git-cz',
    icon: 'mdi:git',
    project_url: 'https://github.com/k3ii/git-cz',
    author_github_username: 'k3ii',
    categories: ['git', 'cli'],
    description: 'A simple git commitizen written in Rust'
  },
  {
    title: 'qdir',
    icon: 'material-symbols-light:folder-copy-outline',
    project_url: 'https://github.com/k3ii/qdir',
    author_github_username: 'k3ii',
    categories: ['cli'],
    description: 'Quick Directory Generator'
  },
  {
    title: 'zourer',
    icon: 'game-icons:shouting',
    project_url: 'https://github.com/nicolasstrands/zourer',
    author_github_username: 'nicolasstrands',
    categories: ['dictionary', 'open-data'],
    description: 'A dictionary of profanity words in the Mauritian Kreol language.'
  },
  {
    title: 'Mauritius Tax Calculator',
    icon: 'tdesign:money',
    project_url: 'https://github.com/n-d-r-d-g/redesigned/tree/main/mauritius_tax_calculator',
    author_github_username: 'n-d-r-d-g',
    categories: ['taxation', 'calculator', 'mauritius'],
    description: 'A simple tax calculator for Mauritius',
  },
  {
    title: 'CSS Clock',
    icon: 'mdi:clock-time-eight',
    project_url: 'https://clock-css.netlify.app/',
    author_github_username: 'MrSunshyne',
    categories: ['css', 'clock'],
    description: 'A simple clock made with CSS',
  },
  {
    title: 'Le Pop Quiz',
    icon: 'material-symbols-light:question-exchange-rounded',
    project_url: 'https://lepopquiz.com/',
    author_github_username: 'cedpoilly',
    categories: ['quiz', 'game', 'real-time', 'ai'],
    description: 'A real-time quiz game with AI',
  },
  {
    title: 'mudocs',
    icon: 'material-symbols:edit-document-rounded',
    project_url: 'https://github.com/n-d-r-d-g/redesigned/tree/main/mudocs',
    author_github_username: 'n-d-r-d-g',
    categories: ['Document', 'Generators', 'mauritius'],
    description: 'A community-driven solution to public processes in Mauritius',
  },
  {
    title: 'kouran',
    icon: 'pepicons-pop:electricity-off',
    project_url: 'https://github.com/k3ii/kouran',
    author_github_username: 'k3ii',
    categories: ['Mauritius', 'cli'],
    description: 'View Power outages in Mauritius from your terminal'
  },
  {
    title: 'Dodo Dodge',
    icon: 'game-icons:dodo',
    project_url: 'https://github.com/nicolasstrands/dodo-dodge-ce',
    author_github_username: 'nicolasstrands',
    categories: ['game', 'dodo'],
    description: 'Dodo Dodge is a simple runner game where you play as a dodo bird and either dodge hunters or stomp on them.'
  },
  {
    title: 'Mauritius public holidays dataset',
    icon: 'material-symbols:dataset',
    project_url: 'https://github.com/nicolasstrands/mauritius-public-holidays-dataset',
    author_github_username: 'nicolasstrands',
    categories: ['open-data', 'Mauritius'],
    description: 'Simple Dataset for Public Holidays in Mauritius'
  },
  {
    title: 'The Philosophical Code',
    icon: 'game-icons:greek-temple',
    project_url: 'https://github.com/houzyk/thephilosophicalcode',
    author_github_username: 'houzyk',
    categories: ['philosophy'],
    description: 'Exploring code from a philosophical point of view'
  },
  {
    title: 'MoBouzer',
    icon: 'ic:baseline-directions-bus',
    project_url: 'https://github.com/danshilm/MoBouzer',
    author_github_username: 'danshilm',
    categories: ['navigation', 'Mauritius'],
    description: 'A cross-platform mobile app for navigating Mauritius by bus based on public transport data and user contributions to OpenStreetMaps.'
  },
  {
    title: 'Animal breeds search',
    icon: 'maki:dog-park-11',
    project_url: 'https://github.com/mahima98/animal-breeds',
    author_github_username: 'mahima98',
    categories: ['animal', 'data'],
    description: 'You choose a dog breed. It returns you an image of that breed!'
  },
  {
    title: 'ambiance',
    icon: 'ph:music-note-simple-duotone',
    project_url: 'https://ambiance.netlify.app/',
    author_github_username: 'Saamiyah',
    categories: ['music', 'ambiance'],
    description: 'Ambiance was created to mimic a different environment for working everyday.'
  },
  {
    title: 'Meetup.mu',
    icon: 'ph:calendar-duotone',
    project_url: 'https://meetup.mu/',
    author_github_username: 'xelab04',
    categories: ['community', 'Mauritius', 'open-data'],
    description: 'Aggregator for all tech meetups happening in Mauritius, so you can better plan your Saturdays!'
  }

]
