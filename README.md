For local development run the following command:

vite --config vite.config.local.ts

This points to the config file for local development. This config does the following:
- Adds the server object
  - 'host: 0.0.0.0'
    - Allows external devices to access PC's localhost
  - 'https: true'
    - Enables prompt for camera access on external devices

We don't want to run https in the bolt environment as it breaks the preview functionality.