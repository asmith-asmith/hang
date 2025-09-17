# Overview

This is a modern full-stack dating and activity matching application built with React, Express, and PostgreSQL. The app allows users to discover activities, connect with potential matches based on shared interests, and communicate through an integrated messaging system. Users can browse activities by category, express interest, get matched with like-minded people, and chat with their matches.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite as the build tool. The application follows a component-based architecture with:

- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui for consistent, accessible design system
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend is organized into pages (discover, matches, messages, etc.) with reusable components and custom hooks. The app is designed mobile-first with a bottom navigation pattern typical of dating apps.

## Backend Architecture
The backend uses Express.js with TypeScript in ES module format. Key architectural decisions:

- **RESTful API**: Clean REST endpoints for users, activities, matches, and messages
- **Layered Architecture**: Separation of concerns with routes, storage layer, and middleware
- **Development Setup**: Vite integration for hot module replacement during development
- **Error Handling**: Centralized error handling middleware with structured JSON responses
- **Request Logging**: Custom middleware for API request/response logging

## Database Architecture
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **Schema Definition**: Centralized schema definitions in TypeScript with Zod validation
- **Migration Management**: Drizzle Kit for database migrations and schema management
- **Type Safety**: Full TypeScript integration from database to frontend
- **Connection**: Neon serverless PostgreSQL for cloud deployment

The database includes tables for users, activities, user interests, matches, and messages with proper foreign key relationships.

## Data Storage Strategy
A hybrid approach is implemented:

- **Production**: PostgreSQL database with Drizzle ORM
- **Development**: In-memory storage class implementing the same interface
- **Interface-Based Design**: IStorage interface allows seamless switching between storage implementations

This design enables rapid development and testing while maintaining production database capabilities.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: TypeScript ORM for database operations and migrations

## UI and Styling
- **Radix UI**: Headless, accessible UI component primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library based on Radix UI

## Development Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Static type checking across the entire stack
- **Replit Plugins**: Development environment enhancements for the Replit platform

## Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for forms and API data
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## State Management and API
- **TanStack Query**: Server state management, caching, and synchronization
- **Wouter**: Lightweight client-side routing library

The application is designed to be easily deployable on platforms like Replit, with environment-based configuration and cloud-ready architecture.