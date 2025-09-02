# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy the rest of the server code
COPY . .

# Expose the port the server runs on
EXPOSE 5000

# Start the server
CMD ["node", "src/index.js"]
