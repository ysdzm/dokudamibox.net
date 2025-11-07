# [blog.dokudamibox.net](https://blog.dokudamibox.net)

- ![Deployment Status](https://github.com/ysdzm/blog.dokudamibox.net/actions/workflows/deploy.yml/badge.svg)

This repository contains the source code for a static website built with [Astro](https://astro.build/).

## Features

- 🌟 **Static Site Generation** powered by Astro
- 🚀 **Automatic Deployment** via GitHub Actions
- 🔧 **Easy Development Setup** with `npm run dev`

## Usage

```bash
$ git clone https://github.com/ysdzm/blog.dokudamibox.net.git

$ cd blog.dokudamibox.net

$ npm install

$ npm run dev
```

## Deploy

This project is automatically deployed using GitHub Actions.  

### Automatic Deployment

- Pushing changes to the `main` branch triggers the deployment workflow.  
- You can monitor deployment progress and logs in the [Actions tab](https://github.com/ysdzm/blog.dokudamibox.net/actions).  

## Development Environment (Optional: DevContainer)

For an optimized development setup, use the included DevContainer configuration:

1. Ensure you have the following installed:
   - [Docker](https://www.docker.com/)
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. Open the repository in VS Code and choose **"Reopen in Container"**.  

3. Once the container is running, install dependencies:  
```
$ npm install
```

4. Start the development server:  
```
$ npm run dev
```
## Contributing

We welcome contributions! Feel free to open issues or submit pull requests to improve the project.  

## License

This project is licensed under the [MIT License](./LICENSE).  
