# How to Deploy to Portainer

This guide explains how to deploy the application to a Portainer instance using the provided Docker files.

## Deployment Options.

### Option 1: Backend API Only (Port 8085)
Use `docker-compose.backend-only.yml` - Deploys only the Express backend API server on port 8085

### Option 2: Full Application
Use `docker-compose.yml` - Deploys both backend (8085) and frontend (80)

The recommended method is to use Portainer's "Stack" feature.

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

-   **Compose path:** 
    -   For backend API only: `docker-compose.backend-only.yml`
    -   For full application: `docker-compose.yml` (default)

-   **Environment variables:** Add the following required environment variables:
    -   `SUPABASE_URL`: Your Supabase project URL
    -   `SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 3. Deploy the Stack

-   Click the **Deploy the stack** button.

-   Portainer will now pull your code from the Git repository, build the Docker image using the `Dockerfile` (this may take a few minutes the first time), and then start the container as defined in your `docker-compose.yml`.

### 4. Access Your Application

Once the deployment is complete, the stack will show as `running`.

**Backend API Only:**
-   Backend API: `http://<your-server-ip>:8085`
-   Health check: `http://<your-server-ip>:8085/health`
-   API endpoints available at `/api/*`

**Full Application:**
-   Frontend: `http://<your-server-ip>:80`
-   Backend API: `http://<your-server-ip>:8085`

## Updating the Application

To update your application, simply:
1.  Push your code changes to your Git repository.
2.  In Portainer, navigate to your stack's details page.
3.  Click the **Pull and redeploy** button.

Portainer will automatically pull the latest code, rebuild the image if necessary, and restart the service with the new version.
