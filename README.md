# Unisex Salon App

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill MONGO_URI and ADMIN_KEY
3. `npm start` -> http://localhost:3000  (admin: /admin.html)

## MongoDB Atlas (free)
1. mongodb.com/atlas -> create free M0 cluster
2. Database Access -> add a user + password
3. Network Access -> allow 0.0.0.0/0
4. Connect -> Drivers -> copy the connection string into MONGO_URI (add /salon before the ?)

## Deploy on Render (free)
1. Push this folder to a GitHub repo
2. render.com -> New -> Web Service -> pick the repo
3. Build command: `npm install`   Start command: `npm start`   Instance: Free
4. Environment: add MONGO_URI and ADMIN_KEY
5. Deploy -> your app is live at https://yourapp.onrender.com
# rithikas-unisex-salon
