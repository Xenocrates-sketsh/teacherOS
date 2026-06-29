# Teacher Workspace

A premium educational platform focused on teachers and students.

## Features

- Teacher authentication
- Student registration with teacher approval
- Schools, Classes, and Subject Workspaces
- Lessons, Homework, Announcements, and Resources
- Student dashboard with digital student card
- QR code for class joining
- Search and Archive functionality

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Monorepo**: Turborepo

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd teacher-workspace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   ```
   Edit `.env.local` with your Supabase credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the migration:
   ```bash
   npx supabase db push
   ```

## Project Structure

```
teacher-workspace/
├── apps/
│   └── web/                    # Next.js application
├── packages/
│   └── shared/                 # Shared types and utilities
├── supabase/
│   ├── migrations/             # Database migrations
│   └── config.toml            # Supabase configuration
├── package.json
└── turbo.json
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter

## License

MIT
