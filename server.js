const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// All the Games & Prompts!
const games = {
    tod: [
        "💖 Truth: What was your exact first thought when we met?",
        "🤪 Dare: Send the most chaotic selfie you can take right now.",
        "💖 Truth: What is a tiny, everyday thing I do that you love?",
        "🤪 Dare: Record a voice memo of you singing a romantic song and send it to me.",
        "💖 Truth: If you could teleport us anywhere in the world right now, where would we go?"
    ],
    wyr: [
        "🤔 Would you rather: Have a cozy movie night in, or get dressed up for a fancy dinner?",
        "🤔 Would you rather: Always have to hold hands when we are in public, or never be able to hold hands again?",
        "🤔 Would you rather: Cook a disastrous meal together, or order your favorite takeout?",
        "🤔 Would you rather: Go on a spontaneous weekend road trip, or have a fully planned luxury vacation?"
    ],
    mostLikely: [
        "🧐 Who is most likely to... fall asleep 10 minutes into a movie?",
        "🧐 Who is most likely to... survive a zombie apocalypse?",
        "🧐 Who is most likely to... randomly start singing in public?",
        "🧐 Who is most likely to... forget where they parked the car?",
        "🧐 Who is most likely to... secretly eat the last slice of pizza and deny it?"
    ],
    nhie: [
        "🤫 Never have I ever... practiced what I was going to say to you in the mirror.",
        "🤫 Never have I ever... stalked your social media all the way back to 2015.",
        "🤫 Never have I ever... bought a gift for you and then accidentally ruined the surprise.",
        "🤫 Never have I ever... laughed at a joke you made even when I didn't get it."
    ],
    dateNight: [
        "🍿 Date Night Idea: Build a blanket fort and watch a movie from our childhoods.",
        "🍝 Date Night Idea: We have to cook a 3-course meal together using only what's currently in the kitchen.",
        "🌌 Date Night Idea: Late night drive with our favorite playlist and zero destination.",
        "🎮 Date Night Idea: Video game tournament—loser buys the winner dessert next time."
    ]
};

io.on('connection', (socket) => {
    console.log('A user connected to the server.');

    // 1. Join a Private Room
    socket.on('join room', ({ name, roomCode }) => {
        socket.join(roomCode);
        socket.username = name;
        socket.roomCode = roomCode;
        io.to(roomCode).emit('chat message', `🔔 ${name} has joined the cozy corner!`);
    });

    // 2. Handle Chat Messages
    socket.on('chat message', (msg) => {
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('chat message', `**${socket.username}**: ${msg}`);
        }
    });

    // 3. Handle Game Switching & Drawing Cards
    socket.on('draw card', (gameChoice) => {
        if (socket.roomCode && games[gameChoice]) {
            const prompts = games[gameChoice];
            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            io.to(socket.roomCode).emit('game update', randomPrompt); 
        }
    });

    // 4. Handle Shared Canvas Drawing
    socket.on('drawing', (data) => {
        if (socket.roomCode) {
            socket.to(socket.roomCode).emit('drawing', data);
        }
    });

    socket.on('clear canvas', () => {
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('clear canvas');
        }
    });

    // 5. Handle Floating Hearts
    socket.on('send love', (emoji) => {
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('receive love', emoji);
        }
    });

    socket.on('disconnect', () => {
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('chat message', `🔔 ${socket.username || 'Someone'} disconnected.`);
        }
    });
});

server.listen(3000, () => {
    console.log('Private Hub is running on http://localhost:3000');
});