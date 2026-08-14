# FreeSolo — Expo React Native App

**Expo SDK 57 · React Navigation · Stripe · Push Notifications · TypeScript**

The mobile client for the FreeSolo platform. Hits the Spring Boot REST API directly using a `Bearer` JWT token stored securely on-device.

## Quick start

```bash
pnpm install
pnpm start
```

Scan the QR code with **Expo Go** (iOS/Android).

## Environment

Set mobile build values in your shell or CI environment; the repository does not keep a second environment file.

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Spring Boot API URL. Leave blank on simulator (auto-detected). Set to your machine's LAN IP (e.g. `http://192.168.1.x:8080`) on a physical device, or your production URL in releases. |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key — `pk_test_...` in development. |

> **Physical device tip:** set `EXPO_PUBLIC_API_URL` to your machine's local IP, not `localhost`.

## Setup checklist

- [ ] Spring Boot API running (see `api/README.md`)
- [ ] `EXPO_PUBLIC_API_URL` set if on a physical device
- [ ] `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` set in your shell or CI environment

## Tech stack

| Feature | Library |
|---|---|
| Navigation | `@react-navigation/native` + native-stack + bottom-tabs |
| Auth | JWT stored in `expo-secure-store` — issued by the Spring Boot API |
| Payments | `@stripe/stripe-react-native` |
| Push notifications | `expo-notifications` |
| Image upload | `expo-image-picker` → `POST /api/uploads` |
| Fonts | Playfair Display + DM Sans via `expo-font` |
| Gradients | `expo-linear-gradient` |

## Authentication

The app signs users in via `POST /api/auth/otp/verify` (or OAuth). Spring Boot returns a JWT that is saved with `expo-secure-store`. Every subsequent API request sends `Authorization: Bearer <token>`.

## Screens

### Auth flow
| Screen | Description |
|---|---|
| `SplashScreen` | Animated logo |
| `WhoScreen` | Traveler vs Business selector |
| `HowItWorksScreen` | Onboarding |
| `TravelerEntryScreen` | OTP / Google / Apple sign-in entry |
| `ApplyScreen` | Host application form |
| `SignInScreen` | OTP email sign-in |

### Traveler tabs
| Screen | Description |
|---|---|
| `FeedScreen` | Experience cards with search and category filters |
| `ExploreMapScreen` | Map with GPS and venue markers |
| `CreateExperienceScreen` | Host creates an experience |
| `NotificationsScreen` | Push notifications with unread badge |
| `ProfileScreen` | Avatar, travel credits, bookings, sign-out |

### Modal screens
| Screen | Description |
|---|---|
| `ExperienceDetailScreen` | Detail: map, reviews, host card, CTA |
| `BookingScreen` | Seat selector, guest note, price breakdown |
| `PaymentScreen` | Stripe PaymentSheet |
| `ConfirmedScreen` | Animated booking confirmation |

### Business flow
| Screen | Description |
|---|---|
| `BusinessOnboardingScreen` | Venue registration |
| `BusinessDashboardScreen` | Bookings, revenue stats |

## Project structure

```
mobile/
├── App.tsx                          Root — StripeProvider + AuthProvider + Navigation
└── src/
    ├── theme/index.ts               Design tokens (colors, fonts, spacing)
    ├── components/                  Shared UI (Button, Card, Field, Chip…)
    ├── context/AuthContext.tsx      useAuth() hook — session, login, logout
    ├── lib/
    │   ├── api.ts                   apiFetch() with auto Bearer token injection
    │   └── notifications.ts         Expo push token registration
    ├── navigation/AppNavigator.tsx  Stack + Bottom Tab navigator
    └── screens/
        ├── auth/
        ├── traveler/
        └── business/
```

## Stripe payment flow

1. User taps "Reserve" → `POST /api/stripe/payment-intent` → returns `clientSecret`
2. App presents `PaymentScreen` with Stripe PaymentSheet
3. On success, Stripe webhook fires → Spring Boot confirms booking → push notification sent

## Push notifications

Tokens are registered automatically after sign-in. Test locally:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{"to":"ExponentPushToken[...]","title":"Test","body":"Hello FreeSolo!"}'
```
