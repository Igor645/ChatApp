# Use Node.js as base image
FROM node:latest

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application files to the working directory
COPY . .

# Expose the port your application is running on
EXPOSE 3000

# Command to run the application
CMD ["node", "server/app.js"]
