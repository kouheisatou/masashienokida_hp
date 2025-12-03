# Feature List: Existing vs Renewal

## 1. Existing Site Features (https://www.masashi-enokida.com/)
Based on deep analysis of the current website.

### Public Facing
- **Home**: Main banner, Latest info, Video gallery (embedded videos).
- **Biography**: Static text profile.
- **Concert**: List of past and upcoming concerts.
- **History**: List of past events/milestones.
- **Supporters**:
    - **Mail Members (Free)**: Email subscription form.
    - **Gold Members (Paid)**: Mentioned, likely requires login.
- **Contact**: Contact form (Name, Email, Subject, Message).
- **Search**: Header search bar.
- **AI Chat**: Chat button.
- **Login/Register**: Google, Facebook, Email authentication.

### Functional
- **CMS/Admin**: Implicit (ability to update news, concerts, videos).
- **Membership System**: User registration, tier management.

---

## 2. Renewal Features (Theater Style)
Features to be implemented in the new Monorepo (Next.js + Node.js).

### Core Improvements
- **Design**: Complete "Theater Style" overhaul (Dark, Elegant, Serif fonts).
- **Tech Stack**: Modern Next.js 14 + Node.js/Hono + Docker.
- **Performance**: SPA navigation, optimized assets.

### Feature Map
| Feature | Existing | Renewal Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Design Theme** | Standard White/Clean | **Theater Style (Grand Stage)** | 🚧 In Progress |
| **Authentication** | Google/FB/Email | **Google OAuth 2.0** | 🚧 In Progress |
| **Concert List** | Standard List | **Program Style List** | 📅 Planned |
| **News/Info** | Standard List | **Theater Notice Board** | 📅 Planned |
| **Video Gallery** | Embedded List | **Cinema Mode Gallery** | 📅 Planned |
| **Biography** | Static Page | **Styled Profile Section** | 📅 Planned |
| **History** | Static List | **Timeline Visualization** | 📅 Planned |
| **Membership** | Mail / Gold | **Free (Mail) / Gold (Stripe)** | 📅 Planned |
| **Contact Form** | Standard Form | **Styled Letter Form** | 📅 Planned |
| **Search** | Header Input | **Global Search Overlay** | 📅 Planned |
| **AI Chat** | Chatbot | **Integrated AI Assistant** | 📅 Planned |

### New/Enhanced Features
- **Dashboard**: User dashboard for managing subscription and viewing exclusive content.
- **Admin Panel**: Dedicated CMS for managing concerts, news, and members.
