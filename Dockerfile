FROM nginx:mainline

COPY packages/frontendmu-nuxt/.output/public/ /usr/share/nginx/html/