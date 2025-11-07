--- START OF FILE INSTRUCTIONS.md ---

# How to Deploy the Supabase Edge Function

The new "Find Groups" feature uses a Supabase Edge Function to act as a secure API endpoint. To get this working, you need to deploy the function code to your Supabase project.

Follow these steps:

### 1. Install the Supabase CLI

If you don't have it already, you need to install the Supabase Command Line Interface (CLI).

**For macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**For Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```
*(For other installation methods, see the [official Supabase documentation](https://supabase.com/docs/guides/cli/getting-started))*

### 2. Log in to the Supabase CLI

Open your terminal and run the following command. This will open a browser window for you to authorize the CLI.

```bash
supabase login
```

### 3. Link Your Local Project to Supabase

In your terminal, navigate to the root directory of this project and run the following command. Replace `<your-project-ref>` with your actual Project Reference ID from your Supabase project's dashboard (URL: `https://supabase.com/dashboard/project/<your-project-ref>`).

```bash
supabase link --project-ref <your-project-ref>
```
You will be asked for your database password.

### 4. Set Required Secrets

The Edge Function needs two secret environment variables to connect to your database securely. Run the following commands in your terminal, replacing the placeholder values with your own from your Supabase Project's "API Settings" page.

- **`SUPABASE_URL`**: Your project's URL.
- **`SUPABASE_SERVICE_ROLE_KEY`**: Your project's `service_role` key (keep this secret!).

```bash
supabase secrets set SUPABASE_URL=https://<your-project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 5. Deploy the Function(s)

Finally, deploy the functions with these commands. You need to deploy each one individually.

```bash
supabase functions deploy find-groups-by-property
```
```bash
supabase functions deploy get-group-template
```

After a few moments, the functions will be deployed and live. Your application's "Find Groups" and "Get Template" modals will now work correctly by calling these new endpoints.