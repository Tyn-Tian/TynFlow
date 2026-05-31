# Gunakan image Bun versi Alpine yang super ringan
FROM oven/bun:1-alpine AS development

# Install libc6-compat
# Ini sangat penting untuk Next.js di Alpine agar compiler SWC bisa berjalan tanpa error
RUN apk add --no-cache libc6-compat

# Set working directory di dalam container
WORKDIR /app

# Salin file dependencies terlebih dahulu
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Salin seluruh kode sumber
COPY . .

# Expose port default Next.js
EXPOSE 3000

# Jalankan server Next.js dalam mode development
CMD ["bun", "run", "dev"]