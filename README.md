# 🏥 Hospital Management System

A modern, AI-powered medical data management platform built for orthotic prescriptions, diagnostics, and media/scans management. This system streamlines patient record management with a focus on orthotic care and medical imaging.

## 🚀 Features

### ✅ Core Functionality
- **Patient Management**: Complete CRUD operations for patient records
- **Hospital Management**: Manage multiple hospital locations and data
- **Media Upload**: Secure file upload for patient photos, videos, and 3D scans
- **3D Model Viewer**: Interactive STL model visualization with multiple scan types
- **Physical Measurements**: Track height, weight, shoe size, and other vital data
- **Emergency Contacts**: Manage emergency contact information
- **Responsive Dashboard**: Modern, mobile-friendly interface
- **Real-time Updates**: Server-side rendering with Next.js App Router

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: Supabase Storage
- **3D Visualization**: React Three Fiber with Drei
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (ready for implementation)

## 📊 Database Schema

The system includes comprehensive data models:

- **Users & Roles**: Multi-role user management
- **Hospitals**: Hospital information and management
- **Patients**: Complete patient information and medical history
- **Media Files**: Patient photos, videos, and documentation
- **3D Scans**: STL models and scan versions with type classification
- **External Files**: PDF reports and medical documents
- **Audit Logs**: Complete change tracking and compliance

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- Supabase account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```env
   POSTGRES_URL=your_postgres_connection_string
   POOLED_DATABASE_URL=your_pooled_postgres_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_AUTO_CORRECTION_ENDPOINT=your_auto_correction_api_endpoint
   ```

4. **Database Setup**
   ```bash
   # Generate and run migrations
   npm run db:generate
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
hospital-management/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Main dashboard pages
│   │   │   ├── patients/       # Patient management
│   │   │   ├── hospitals/      # Hospital management
│   │   │   └── layout.tsx      # Dashboard layout
│   │   ├── ui/                 # App-specific UI components
│   │   └── globals.css         # Global styles
│   ├── components/ui/          # Shadcn/ui components
│   ├── database/               # Database schema and migrations
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── connection.ts       # Database connection
│   │   └── migrations/         # Database migrations
│   ├── lib/                    # Utilities and data access
│   │   ├── patients/           # Patient-related functions
│   │   ├── hospitals/          # Hospital-related functions
│   │   ├── scans/              # 3D scan operations
│   │   ├── media-files/        # Media file operations
│   │   ├── supabase-storage.ts # File storage utilities
│   │   └── definitions.ts      # TypeScript type definitions
│   └── scripts/                # Database seeding
├── drizzle.config.ts           # Drizzle ORM configuration
└── package.json               # Dependencies and scripts
```

## 🎨 UI/UX Features

- **Modern Design**: Clean, medical-focused interface
- **Responsive Layout**: Optimized for desktop and mobile
- **Accessibility**: Built with accessibility in mind
- **Light Theme**: Professional medical environment design
- **Component Library**: Consistent, reusable UI components
- **3D Visualization**: Interactive 3D model viewing capabilities

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with sample data

## 🗄️ Database Management

### Migrations
```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# View database in Drizzle Studio
npm run db:studio
```

### Seeding
```bash
# Seed with sample data
npm run db:seed
```

## 🔐 Security & Compliance

- **Data Encryption**: Secure database connections
- **File Security**: Protected file uploads with Supabase
- **Audit Trail**: Complete change logging
- **Role-based Access**: Multi-level user permissions (ready for implementation)
- **HIPAA Ready**: Designed with medical data compliance in mind

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the PRD.md file for detailed requirements

---

Built with ❤️ for better healthcare management
