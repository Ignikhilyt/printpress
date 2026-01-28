# PrintPress Database Schema Addition

## Newsletter Subscriber Model

Add this to the end of `server/prisma/schema.prisma`:

```prisma
model NewsletterSubscriber {
  id             String    @id @default(uuid())
  email          String    @unique
  isActive       Boolean   @default(true)
  ipAddress      String?
  userAgent      String?
  subscribedAt   DateTime  @default(now())
  unsubscribedAt DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([email])
  @@index([isActive])
  @@map("newsletter_subscribers")
}
```

## Migration Steps

After adding the model, run:

```bash
cd server
npx prisma generate
npx prisma db push
```

This will create the `newsletter_subscribers` table in your database.
