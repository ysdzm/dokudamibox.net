# [dokudamibox.net](https://dokudamibox.net)

![Deployment Status](https://github.com/ysdzm/dokudamibox.net/actions/workflows/deploy.yml/badge.svg)

This repository contains the source code for a static website built with [Astro](https://astro.build/).

## Features

- 🌟 **Static Site Generation** powered by Astro
- 🚀 **Automatic Deployment** via GitHub Actions
- 🔧 **Easy Development Setup** with `npm run dev -- --host 0.0.0.0`

## Usage

```bash
$ git clone https://github.com/ysdzm/dokudamibox.net.git

$ cd dokudamibox.net

$ npm install

$ npm run dev -- --host 0.0.0.0
```

## Images in posts

Add images directly to the Markdown or MDX body:

```markdown
![Description of the image](./image.png)
```

Images display at up to 300px wide. The first Markdown image in a post is also
used by Home, Posts, tag lists, and related-post cards. There is no separate
`coverImage` field. Reference-style Markdown images are supported too.
