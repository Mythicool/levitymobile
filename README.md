# Levity Loyalty Mobile App

A comprehensive loyalty program mobile application for Levity Breakfast House, built with React Native and Expo.

## 🏠 About Levity Breakfast House

Levity Breakfast House is a warm, welcoming restaurant that serves delicious breakfast and lunch in a historic, cozy atmosphere. Our loyalty program rewards customers for their visits and builds a stronger community connection.

## 📱 Mobile App Features

### Core Functionality
- **User Authentication** - Secure login and registration
- **QR Code Check-ins** - Earn points by scanning QR codes at the restaurant
- **Points System** - Track and accumulate loyalty points
- **Rewards Catalog** - Browse and redeem rewards with points
- **Profile Management** - View account details and transaction history

### Mobile-Specific Features
- **Real QR Code Scanning** - Camera integration with haptic feedback
- **Offline Data Sync** - Works without internet, syncs when connected
- **Push Notifications** - Stay updated on rewards and promotions
- **Native Navigation** - Smooth bottom tab navigation
- **Responsive Design** - Optimized for all screen sizes

## 🚀 Project Structure

```
levitymobile/
├── levityloyalty/          # Original web application
├── LevityLoyaltyMobile/    # React Native CLI version
└── LevityLoyaltyExpo/      # Expo version (recommended)
```

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo SDK 53
- **Navigation**: React Navigation 6
- **State Management**: React Context + TanStack Query
- **Storage**: AsyncStorage for offline data
- **Camera**: Expo Camera for QR code scanning
- **Styling**: Custom theme system with Levity brand colors
- **Deployment**: Expo Application Services (EAS)

## 🎨 Design System

The app uses Levity's warm, historic brand aesthetic:
- **Primary Colors**: Warm browns and tans
- **Accent Colors**: Golden yellows
- **Typography**: Clean, readable fonts
- **Icons**: Friendly emoji-based navigation

## 📋 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS testing)
- Android Studio (for Android testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mythicool/levitymobile.git
   cd levitymobile
   ```

2. **Install dependencies for Expo version**
   ```bash
   cd LevityLoyaltyExpo
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Test on devices**
   - **Web**: Open `http://localhost:8082`
   - **Mobile**: Scan QR code with Expo Go app
   - **iOS Simulator**: Press `i` in terminal
   - **Android Emulator**: Press `a` in terminal

### Demo Credentials
- **Email**: `demo@levity.com`
- **Password**: `demo123`

## 📱 Mobile Testing

### Using Expo Go
1. Install Expo Go from App Store (iOS) or Google Play (Android)
2. Scan the QR code displayed in your terminal
3. Test all features on your physical device

### Features to Test
- [ ] Login/Registration flow
- [ ] Dashboard navigation
- [ ] QR code scanning (camera permissions)
- [ ] Check-in functionality with haptic feedback
- [ ] Rewards browsing and redemption
- [ ] Profile settings and data management
- [ ] Offline functionality

## 🎁 Rewards System

The app includes a complete rewards catalog:

| Reward | Points | Category |
|--------|--------|----------|
| Free Coffee | 50 pts | Drinks |
| Free Pastry | 75 pts | Food |
| Breakfast Sandwich | 100 pts | Food |
| Specialty Drink | 75 pts | Drinks |
| Lunch Combo | 150 pts | Food |
| Levity Mug | 200 pts | Merchandise |
| Coffee Beans (1lb) | 175 pts | Merchandise |
| Private Tasting | 500 pts | Experience |

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the Expo project root:
```
API_BASE_URL=https://your-api-endpoint.com
EXPO_PUBLIC_API_URL=https://your-api-endpoint.com
```

### App Configuration
Key settings in `app.json`:
- App name and slug
- Version and build numbers
- Platform-specific configurations
- Permissions (camera, notifications)

## 🚀 Deployment

### Web Deployment (Netlify)
The web version can be deployed to Netlify:

1. **Build for web**
   ```bash
   npm run web:build
   ```

2. **Deploy to Netlify**
   - Connect GitHub repository
   - Set build command: `cd LevityLoyaltyExpo && npm run web:build`
   - Set publish directory: `LevityLoyaltyExpo/web-build`

### Mobile App Deployment

#### Using Expo Application Services (EAS)
1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for stores**
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

4. **Submit to stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## 📊 App Store Information

### iOS App Store
- **Category**: Food & Drink
- **Age Rating**: 4+
- **Required Permissions**: Camera (for QR scanning)

### Google Play Store
- **Category**: Food & Drink
- **Content Rating**: Everyone
- **Required Permissions**: Camera, Storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Levity Breakfast House.

## 📞 Support

For technical support or questions:
- Create an issue in this repository
- Contact the development team

## 🎯 Roadmap

### Phase 1 ✅ Complete
- [x] Basic mobile app structure
- [x] Authentication system
- [x] QR code scanning
- [x] Points and rewards system
- [x] Profile management

### Phase 2 🚧 In Progress
- [ ] Push notifications
- [ ] Social sharing features
- [ ] Advanced analytics
- [ ] Multi-location support

### Phase 3 📋 Planned
- [ ] Apple Pay / Google Pay integration
- [ ] Advanced personalization
- [ ] Referral system
- [ ] Gamification features

---

**Built with ❤️ for Levity Breakfast House**
