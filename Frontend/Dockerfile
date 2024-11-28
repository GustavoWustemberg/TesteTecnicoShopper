# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 80 (you can choose another port if needed)
EXPOSE 80

# Start the Next.js app in production mode
CMD ["npm", "run", "start", "--", "-p", "80"]
