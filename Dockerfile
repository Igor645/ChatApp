# Use an official Node.js runtime as the base image
FROM node:latest

# Create a working directory for the application
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port your app is running on
EXPOSE 3000

# Define the command to run your application
CMD ["node", "server/app.js"]
 