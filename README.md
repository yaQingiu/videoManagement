# Vue 3 + Vite
This is a single, elegant video management website. It contains following features:

1 Using email validation to register, and using email information as an unique ID.

2 Using lazy router to minimize loading time.

3 Checking token consistency before switching pages. 

4 Using Pinia to manage global user & video & category information, reducing web & server interaction time.

5 Using SSE to implement realtime conversation function that likes daily chatting.

6 Upload large video files using the chunked upload function, with a progress bar displayed at the top and support for resumable uploads.

# usage
Firstly,  execute the following command:
git clone https://github.com/你的用户名/你的项目名.git
cd 

Secondly, install Nodejs from **https://nodejs.org**, and test the version by:
node -v
npm -v

Then, execute:
npm install
to load dependencies from package.json and package-lock.json, then **node_modules/** folder will appear in your lists.

Finally, execute:
npm run dev
to run the project.
