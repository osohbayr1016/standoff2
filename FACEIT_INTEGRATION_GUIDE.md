# 🎮 FACEIT Integration Guide

CS2 тоглогчдод зориулсан FACEIT integration-г хэрхэн ашиглах талаарх заавар.

## 📋 Боломжууд

### ✅ Хэрэгжүүлсэн функцууд:

- **FACEIT Account Linking** - CS2 тоглогчид өөрсдийн FACEIT аккаунтыг холбох
- **Real-time ELO Display** - Бодит цагийн ELO болон level харуулах
- **Automatic Sync** - 30 минут тутам автомат шинэчлэгдэх
- **Stats Display** - K/D, Win Rate, Headshot % гэх мэт статистик
- **Rank Integration** - FACEIT level-аас хамааран rank автомат шинэчлэгдэх
- **Visual Indicators** - Level-ээс хамааран өнгө өөрчлөгдөх

### 🔧 Backend Features:

- FACEIT API integration
- Real-time data synchronization
- Automatic rank updates
- Error handling and logging
- Bulk refresh capabilities

### 🎨 Frontend Features:

- Interactive FACEIT integration component
- Real-time ELO display on player cards
- Level-based color coding
- Manual refresh capability
- Link/unlink functionality

## 🚀 Setup Guide

### 1. FACEIT API Key Setup

```bash
# Backend .env файлд нэмнэ үү:
FACEIT_API_KEY=your-faceit-api-key-here
```

**FACEIT API Key авах:**

1. [FACEIT Developers](https://developers.faceit.com/) руу очно уу
2. Account үүсгээд API key авна уу
3. `.env` файлд `FACEIT_API_KEY` талбарт оруулна уу

### 2. Dependencies Install

```bash
# Backend
cd backend
npm install axios node-cron

# Dependencies аль хэдийн package.json-д байгаа
```

### 3. Database Migration

MongoDB-д шинэ `faceitData` field автоматаар нэмэгдэнэ. Migration шаардлагагүй.

### 4. Server Restart

```bash
cd backend
npm run dev
```

Server ажиллаж эхэлснээр:

- FACEIT sync service автоматаар эхэлнэ
- 30 минут тутам холбогдсон бүх FACEIT аккаунтууд шинэчлэгдэнэ

## 📱 How to Use (Хэрэглэгчдэд зориулсан)

### CS2 тоглогчдод зориулсан заавар:

1. **Profile руу орно уу**

   - Та CS2 профайлтай байх ёстой
   - FACEIT Integration хэсэг харагдана

2. **FACEIT аккаунт холбоно уу**

   - "FACEIT холбох" товч дарна уу
   - Өөрийн FACEIT nickname оруулна уу
   - "Шалгах" дарж аккаунт байгаа эсэхийг шалгана уу
   - "Холбох" дарж холбоно уу

3. **Real-time мэдээлэл харна уу**
   - ELO болон Level бодит цагт харагдана
   - Player card дээр FACEIT badge харагдана
   - Stats автоматаар шинэчлэгдэнэ

## 🔄 API Endpoints

### Authentication Required Endpoints:

```bash
# FACEIT аккаунт холбох
POST /api/faceit/link
{
  "faceitNickname": "player123"
}

# FACEIT аккаунт салгах
DELETE /api/faceit/unlink

# Мэдээлэл шинэчлэх
POST /api/faceit/refresh

# FACEIT төлөв шалгах
GET /api/faceit/status
```

### Public Endpoints:

```bash
# FACEIT nickname шалгах
POST /api/faceit/verify
{
  "nickname": "player123"
}
```

## 📊 Data Structure

### Player Profile with FACEIT Data:

```typescript
interface PlayerProfile {
  // ... бусад мэдээлэл
  faceitData?: {
    faceitId: string; // FACEIT player ID
    nickname: string; // FACEIT nickname
    avatar: string; // FACEIT avatar URL
    country: string; // Улс
    level: number; // FACEIT level (1-10)
    elo: number; // FACEIT ELO
    gamePlayerStats?: {
      averageKD: number; // K/D ratio
      averageKR: number; // K/R ratio
      averageHeadshots: number; // Headshot %
      winRate: number; // Win rate %
      matches: number; // Тоглосон тоглолт
    };
    lastUpdated: Date; // Сүүлд шинэчлэгдсэн огноо
    isActive: boolean; // Идэвхтэй эсэх
  };
}
```

## 🎨 UI Components

### FACEIT Integration Component

```tsx
<FaceitIntegration
  playerGame={profile.game}
  onFaceitDataUpdate={(faceitData) => {
    // FACEIT мэдээлэл шинэчлэгдэх үед
  }}
/>
```

### Player Card with FACEIT

CS2 тоглогчдын хувьд player card дээр FACEIT badge автоматаар харагдана:

- Level-ээс хамааран өнгө
- ELO мэдээлэл
- FACEIT nickname

## 🔧 Configuration

### Sync Service Settings:

```typescript
// Sync interval: 30 минут
// Auto-refresh: 1 цагаас хуучин мэдээлэл
// Error handling: Алдаа гарсан тохиолдолд лог хадгална
```

### Rank Mapping:

```typescript
const rankMap = {
  1: "Silver",
  2: "Silver Elite",
  3: "Gold Nova",
  4: "Gold Nova Master",
  5: "Master Guardian",
  6: "Master Guardian Elite",
  7: "Distinguished Master Guardian",
  8: "Legendary Eagle",
  9: "Legendary Eagle Master",
  10: "Supreme Master First Class",
};
```

## 🚨 Troubleshooting

### Common Issues:

1. **"FACEIT аккаунт олдсонгүй"**

   - Nickname зөв бичигдсэн эсэхийг шалгана уу
   - FACEIT дээр CS2 тоглоом байгаа эсэхийг шалгана уу

2. **"API key алдаа"**

   - `FACEIT_API_KEY` зөв тохируулагдсан эсэхийг шалгана уу
   - API key хүчинтэй эсэхийг FACEIT developers сайтаас шалгана уу

3. **"Мэдээлэл шинэчлэгдэхгүй байна"**
   - Server log шалгана уу: `Error in FACEIT sync service`
   - Manual refresh оролдоно уу

### Debug Commands:

```bash
# Server logs шалгах
npm run dev

# Database шалгах
db.playerprofiles.find({"faceitData": {$exists: true}})

# Sync stats авах
GET /api/faceit/bulk-refresh
```

## 📈 Performance

### Optimization:

- **API Rate Limiting**: FACEIT API limits-г хүндэтгэн 30 минут interval
- **Selective Updates**: Зөвхөн өөрчлөлт байх үед мэдээлэл шинэчлэнэ
- **Error Handling**: API алдаа гарсан тохиолдолд graceful handling
- **Caching**: lastUpdated ашиглан ненужная API calls зайлсхийнэ

### Monitoring:

```bash
# Sync statistics
GET /api/faceit/bulk-refresh

# Response format:
{
  "results": {
    "updated": 5,
    "failed": 0,
    "skipped": 10,
    "errors": []
  }
}
```

## 🔐 Security

### API Key Protection:

- Environment variables ашиглан API key нуух
- Server-side validation
- Rate limiting

### Data Privacy:

- Зөвхөн public FACEIT мэдээлэл авах
- User consent required for linking
- Easy unlink functionality

---

## ✅ Completed Features Summary

✅ **CS2 Player FACEIT Integration**

- Real-time ELO and level display
- Automatic synchronization every 30 minutes
- Manual refresh capability
- Account linking/unlinking
- FACEIT stats display (K/D, Win Rate, Headshots, etc.)
- Level-based color coding
- Rank auto-update based on FACEIT level
- Error handling and validation
- Performance optimization
- Security measures

Энэ интеграци нь CS2 тоглогчдод өөрсдийн FACEIT ELO болон level-г бодит цагт харуулах боломжийг олгож, платформын competitive аспектийг сайжруулна.

## 🎯 Future Enhancements

### Potential additions:

- [ ] Match history integration
- [ ] Tournament FACEIT requirements
- [ ] Team average FACEIT level
- [ ] FACEIT leaderboards
- [ ] Achievement system based on FACEIT progress
