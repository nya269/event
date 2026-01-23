FROM node:18-alpine

Create app directory
WORKDIR /app

Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

Copy source code
COPY . .

Create necessary directories
RUN mkdir -p uploads logs

Expose port
EXPOSE 4000

Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

Start server
CMD ["npm", "start"]