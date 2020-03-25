# Use Node v8.9.0 LTS
FROM node:carbon

# Setup app working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install
RUN npm install csv-parser
RUN npm install csv-writer
RUN npm install vue-multiselect
RUN npm install vue-material

# Copy sourcecode
COPY . .

# Start app
CMD [ "npm", "start" ]