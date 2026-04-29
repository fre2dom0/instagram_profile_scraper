Instagram Scraper

This is a TypeScript-based tool designed to scrape highlights, stories, and posts from Instagram.
🛠 Installation

To run this project, you need to install TypeScript and the TSX runner globally on your system. This allows you to execute .ts files directly from your terminal.

    Install Node.js: (If not already installed) Download Node.js

    Install TypeScript & TSX globally:
    Open your terminal and run:
    Bash

npm install -g typescript tsx

Install Project Dependencies:
Navigate to the project folder and run:
Bash

    npm install

⚙️ Configuration

Before running the script, update the credentials in ./src/main.ts:
TypeScript

const instagramScraper = new InstagramScraper("NAME", {
    cookie: 'YOUR_COOKIE_HERE',
    crsf_token: "YOUR_TOKEN_HERE",
    user_agent: "Safari 17.10, Mac OS X",
});

🚀 Running the Project

Since you have installed tsx globally, you can run the project with a simple command:
Bash

tsx ./src/main.ts

Note: You don't need to use npx if the package is installed globally.
📂 Project Structure

    src/main.ts: Entry point of the application.

    src/core/: Contains the scraper logic.

    src/types/: TypeScript interfaces and type definitions.

⚠️ Disclaimer

This tool is for educational purposes only. Automated scraping may violate Instagram's Terms of Service. Use responsibly.
