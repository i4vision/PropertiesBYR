# How to Deploy to Portainer

This guide explains how to deploy the application to a Portainer instance using the provided Docker files.

The recommended method is to use Portainer's "Stack" feature, which uses the `docker-compose.yml` file.

## Prerequisites

1.  A working Docker environment managed by Portainer.
2.  Your project code hosted in a Git repository (e.g., GitHub, GitLab). This is the easiest way to deploy.

## Deployment Steps

### 1. Create a New Stack in Portainer

-   Navigate to your Portainer instance in your web browser.
-   From the left-hand menu, select **Stacks**.
-   Click the **Add stack** button.

### 2. Configure the Stack

-   **Name:** Give your stack a descriptive name (e.g., `property-hub-stack`).

-   **Build method:** Select **Git Repository**.

-   **Repository URL:** Enter the URL of your Git repository (e.g., `https://github.com/your-username/your-repo.git`).
    -   If your repository is private, you will also need to enable **Authentication** and provide your Git credentials or an access token.

-   **Compose path:** The default is `docker-compose.yml`, which is correct for this project. You can leave it as is.

-   **Environment variables:** This application does not require any build-time environment variables, so you can skip this section.

### 3. Deploy the Stack

-   Click the **Deploy the stack** button.

-   Portainer will now pull your code from the Git repository, build the Docker image using the `Dockerfile` (this may take a few minutes the first time), and then start the container as defined in your `docker-compose.yml`.

### 4. Access Your Application

-   Once the deployment is complete, the stack will show as `running`.
-   You can access your application in your browser by navigating to the IP address or hostname of your Portainer server, using the port you mapped in `docker-compose.yml`.
-   By default, this is `http://<your-server-ip>:8080`.

## Updating the Application

To update your application, simply:
1.  Push your code changes to your Git repository.
2.  In Portainer, navigate to your stack's details page.
3.  Click the **Pull and redeploy** button.

Portainer will automatically pull the latest code, rebuild the image if necessary, and restart the service with the new version.
