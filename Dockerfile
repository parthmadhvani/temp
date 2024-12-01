
# Step 1: Use the official Node.js image as the base image
FROM node:18
WORKDIR /app
# Step 3: Copy the package.json and package-lock.json into the container
COPY qdp-web/package*.json ./
# Step 4: Install the dependencies inside the container
RUN npm install
# Step 5: Copy the entire project into the container
COPY qdp-web/ ./
# Step 6: Expose the port that the Vite dev server will run on
EXPOSE 8080
# Step 7: Start the Vite development server ..
CMD ["serve", "-s", "dist", "-l", "8080"]
# CMD ["npm", "run", "dev"]