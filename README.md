# 🚀 Habiki Contact Hub

A comprehensive social media contact management system that enables bulk messaging, contact scraping, and multi-platform export capabilities.

## ✨ Features

### 🌐 Social Media Integration
- **Multi-Platform Support**: Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube
- **Bulk Messaging**: Send messages to multiple users across platforms
- **Campaign Management**: Organize and track messaging campaigns
- **Analytics Dashboard**: Monitor engagement and performance metrics

### 🔍 Contact Scraping
- **Platform-Specific Scrapers**: Dedicated scrapers for each social media platform
- **Smart Filtering**: Tag-based contact filtering and targeting
- **Compliance Framework**: Built-in ethics and compliance checking
- **Rate Limiting**: Respectful scraping with platform limits

### 📊 Contact Export
- **Multi-Format Export**: CSV, JSON, Excel, PDF formats
- **Advanced Filtering**: Custom field selection and filtering options
- **Bulk Operations**: Export thousands of contacts efficiently
- **Analytics Integration**: Export with engagement metrics

### 🎨 User Interface
- **Unified Dashboard**: Single interface for all functionality
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI/UX**: Clean, professional design with Habiki branding
- **Real-time Updates**: Live status updates and progress tracking

### 🔧 Admin & Management
- **API Management**: Configure and monitor social media APIs
- **User Authentication**: Secure login system with role management
- **System Testing**: Comprehensive test suite for all functionality
- **Configuration Panel**: Easy management of system settings

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Drizzle ORM** for database management
- **JWT** authentication
- **Rate limiting** and security middleware

### Social Media APIs
- Facebook Graph API
- Instagram Basic Display API
- TikTok API
- Twitter/X API v2
- LinkedIn API
- YouTube Data API v3

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Social media API credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/c0smicalchemist/Habiki-Contact-Hub.git
cd Habiki-Contact-Hub
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your database and API credentials
```

4. **Database setup**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
- Main app: http://localhost:5173
- Login page: http://localhost:5173/login
- Admin panel: http://localhost:5173/admin

## 📁 Project Structure

```
Habiki-Contact-Hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── contexts/     # React contexts
├── api/                    # Backend API
│   ├── routes/            # API routes
│   └── services/         # Business logic
├── shared/                # Shared types and utilities
├── migrations/            # Database migrations
└── docs/                  # Documentation
```

## 🔑 API Configuration

### Social Media Platforms
Each platform requires specific API credentials:

- **Facebook/Instagram**: App ID, App Secret, Access Token
- **Twitter/X**: API Key, API Secret, Bearer Token
- **LinkedIn**: Client ID, Client Secret
- **TikTok**: Client Key, Client Secret
- **YouTube**: API Key

### Admin Panel
Access the admin panel at `/admin` to:
- Configure API credentials
- Monitor API usage and limits
- Manage user accounts
- View system logs

## 🧪 Testing

Run the comprehensive test suite:
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

Or use the browser-based test system:
1. Start the development server
2. Navigate to `test-system.html`
3. Click "Run All Tests"

## 🎯 Demo Credentials

**Admin Login:**
- Email: admin@habiki.com
- Password: admin123

**Test User:**
- Email: user@habiki.com
- Password: user123

## 🔒 Security & Compliance

### Data Protection
- All data is encrypted in transit and at rest
- GDPR-compliant data handling
- User consent management
- Data retention policies

### Scraping Ethics
- Respects robots.txt files
- Implements rate limiting
- Provides opt-out mechanisms
- Follows platform terms of service

### API Security
- JWT-based authentication
- Rate limiting per user
- Input validation and sanitization
- Secure credential storage

## 🌟 Key Features Showcase

### Unified Contact Hub
![Unified Interface](https://via.placeholder.com/800x400/28C6B6/FFFFFF?text=Unified+Contact+Hub)
*Single interface for scraping, managing, and exporting contacts*

### Multi-Platform Support
![Platform Integration](https://via.placeholder.com/800x400/2DD4BF/FFFFFF?text=6+Social+Media+Platforms)
*Seamless integration with major social media platforms*

### Advanced Export Options
![Export Formats](https://via.placeholder.com/800x400/0D9488/FFFFFF?text=4+Export+Formats)
*Flexible export with custom filtering and field selection*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Run the test system for troubleshooting

## 🎨 Branding

**Habiki Logo**: The logo features three people silhouettes representing community and networking, with sound waves emanating from them, symbolizing communication and connection.

**Color Scheme**:
- Primary: `#28C6B6` (Teal)
- Secondary: `#2DD4BF` (Light Teal)  
- Accent: `#0D9488` (Dark Teal)

---

**⭐ Star this repository if you find it helpful!**